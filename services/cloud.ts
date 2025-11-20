
import { db } from './db';

// Use 'any' to avoid static type imports from firebase which might trigger loading
let firebaseApp: any = null;
let firestoreDb: any = null;
let firestoreUtils: any = null; // Will hold { collection, writeBatch, doc, getDocs }

const TABLE_NAMES = [
    'schoolDetails', 'students', 'exams', 'marks', 'dailyLogs', 
    'hpcReports', 'studentExamData', 'sbaReports', 
    'detailedFormativeAssessments', 'sessions', 
    'studentSessionInfo', 'user'
];

export const initFirebase = async () => {
    try {
        const config = await db.cloudConfig.get(1);
        if (config && config.apiKey && config.projectId) {
            // Only load Firebase if config exists
            if (!firebaseApp) {
                // Dynamic imports to prevent loading issues when offline or not configured
                // @ts-ignore
                const { initializeApp } = await import('firebase/app');
                // @ts-ignore
                const { getFirestore, collection, writeBatch, doc, getDocs } = await import('firebase/firestore');
                
                firestoreUtils = { collection, writeBatch, doc, getDocs };

                firebaseApp = initializeApp({
                    apiKey: config.apiKey,
                    authDomain: config.authDomain,
                    projectId: config.projectId,
                    storageBucket: config.storageBucket,
                    messagingSenderId: config.messagingSenderId,
                    appId: config.appId
                });
                firestoreDb = getFirestore(firebaseApp);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.warn("Firebase initialization skipped/failed (likely offline or config missing):", error);
        return false;
    }
};

// Helper to find the best backup document ID
const findBestBackupId = async (currentUsername: string): Promise<string | null> => {
    const { collection, getDocs } = firestoreUtils;
    const schoolsCol = collection(firestoreDb, 'schools');
    const snapshot = await getDocs(schoolsCol);
    
    if (snapshot.empty) {
        return null;
    }

    // 1. Try to find exact match for username
    const matchingDoc = snapshot.docs.find((d: any) => d.id === currentUsername);
    if (matchingDoc) return matchingDoc.id;

    // 2. If not found, fallback to the first available backup
    // This handles cases where username changed or on fresh install
    return snapshot.docs[0].id;
};

export const backupToCloud = async (onProgress?: (msg: string) => void): Promise<void> => {
    if (!firestoreDb || !firestoreUtils) {
        const initialized = await initFirebase();
        if (!initialized) throw new Error("Cloud connection could not be established. Check internet or settings.");
    }

    const { collection, writeBatch, doc } = firestoreUtils;

    // Robust user fetch
    let currentUsername = 'school_backup';
    try {
        const users = await db.user.toArray();
        if (users.length > 0 && users[0].username) {
            currentUsername = users[0].username;
        }
    } catch (e) { console.warn("Error fetching user", e); }

    // Determine Doc ID
    const existingDocId = await findBestBackupId(currentUsername);
    const docId = existingDocId || currentUsername;
    
    const rootRef = doc(firestoreDb, 'schools', docId);

    onProgress?.(`Syncing to cloud ID: ${docId}...`);

    for (const tableName of TABLE_NAMES) {
        if (tableName === 'cloudConfig') continue;
        
        onProgress?.(`Backing up ${tableName}...`);
        const table = db.table(tableName);
        const records = await table.toArray();

        if (records.length === 0) continue;

        // Firestore batch has a limit of 500 operations
        const batchSize = 450; 
        const chunks = [];
        for (let i = 0; i < records.length; i += batchSize) {
            chunks.push(records.slice(i, i + batchSize));
        }

        for (const chunk of chunks) {
            const batch = writeBatch(firestoreDb);
            const colRef = collection(rootRef, tableName);
            
            chunk.forEach((record: any) => {
                try {
                    // Use record ID as document ID if possible for idempotency
                    const recordId = record.id ? String(record.id) : null;
                    const docRef = recordId ? doc(colRef, recordId) : doc(colRef);
                    
                    // Deep sanitize undefined values (Firestore doesn't like them)
                    const sanitizedRecord = JSON.parse(JSON.stringify(record));
                    batch.set(docRef, sanitizedRecord);
                } catch (recErr) {
                    console.warn(`Skipping record in ${tableName} due to error:`, recErr);
                }
            });

            await batch.commit();
        }
    }

    onProgress?.("Backup completed successfully!");
};

export const restoreFromCloud = async (onProgress?: (msg: string) => void): Promise<void> => {
     if (!firestoreDb || !firestoreUtils) {
        const initialized = await initFirebase();
        if (!initialized) throw new Error("Cloud connection could not be established. Check internet or settings.");
    }

    const { collection, getDocs, doc } = firestoreUtils;

    // Robust user fetch
    let currentUsername = 'school_backup';
    try {
        const users = await db.user.toArray();
        if (users.length > 0 && users[0].username) {
            currentUsername = users[0].username;
        }
    } catch (e) { console.warn("Error fetching user", e); }

    onProgress?.("Searching for backup...");
    
    const docId = await findBestBackupId(currentUsername);
    
    if (!docId) {
         throw new Error("No backups found in the cloud.");
    }

    const rootRef = doc(firestoreDb, 'schools', docId);
    onProgress?.(`Found backup: ${docId}. Restoring...`);

    // Process tables sequentially. 
    // CRITICAL FIX: Do NOT wrap the entire loop in a db.transaction. 
    // Doing so with async network calls (getDocs) causes the transaction to commit/fail prematurely.
    
    for (const tableName of TABLE_NAMES) {
        if (tableName === 'cloudConfig') continue;

        onProgress?.(`Restoring ${tableName}...`);
        
        try {
            // 1. Fetch from Cloud
            const colRef = collection(rootRef, tableName);
            const snapshot = await getDocs(colRef);

            if (!snapshot.empty) {
                const records = snapshot.docs.map((d: any) => {
                    const data = d.data();
                    // Force normalization for critical single-record tables
                    if (tableName === 'schoolDetails') {
                        data.id = 1; 
                    }
                    return data;
                });

                // 2. Write to Local DB in a dedicated, fast transaction
                await db.transaction('rw', db.table(tableName), async () => {
                    await db.table(tableName).clear();
                    await db.table(tableName).bulkAdd(records);
                });
                
                // console.log(`Restored ${records.length} records to ${tableName}`);
            } else {
                // console.log(`No data found for ${tableName} in cloud. Keeping local data.`);
            }
        } catch (err: any) {
            console.error(`Failed to restore table ${tableName}:`, err);
            // We continue to the next table instead of crashing the whole process
            // but we might want to notify the user.
        }
    }

    onProgress?.("Restore completed successfully!");
};
