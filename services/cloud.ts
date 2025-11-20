
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

// Helper to find the correct document ID for backup/restore
const getBackupDocId = async (currentUsername: string): Promise<string> => {
    const { collection, getDocs } = firestoreUtils;
    const schoolsCol = collection(firestoreDb, 'schools');
    const snapshot = await getDocs(schoolsCol);
    
    if (snapshot.empty) {
        // No backups exist yet, use current username
        return currentUsername || 'school_backup';
    }

    // If backups exist, try to find one that matches the username
    const matchingDoc = snapshot.docs.find((d: any) => d.id === currentUsername);
    if (matchingDoc) return matchingDoc.id;

    // If no match (e.g. different username or re-install), return the first one found
    // This assumes the Firebase project is dedicated to one school/user.
    return snapshot.docs[0].id;
};

export const backupToCloud = async (onProgress?: (msg: string) => void): Promise<void> => {
    if (!firestoreDb || !firestoreUtils) {
        const initialized = await initFirebase();
        if (!initialized) throw new Error("Cloud connection could not be established. Check internet or settings.");
    }

    const { collection, writeBatch, doc } = firestoreUtils;

    // Robust user fetch: get the first user found, regardless of ID
    const users = await db.user.toArray();
    const currentUser = users.length > 0 ? users[0] : null;
    const currentUsername = currentUser?.username || 'school_backup';

    // Determine Doc ID: Prefer existing one to overwrite, otherwise create new
    const docId = await getBackupDocId(currentUsername);
    const rootRef = doc(firestoreDb, 'schools', docId);

    onProgress?.(`Syncing to cloud ID: ${docId}...`);

    for (const tableName of TABLE_NAMES) {
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
    const users = await db.user.toArray();
    const currentUser = users.length > 0 ? users[0] : null;
    const currentUsername = currentUser?.username || 'school_backup';

    onProgress?.("Searching for backup...");
    
    // Smart Discovery: Find ANY backup
    const docId = await getBackupDocId(currentUsername);
    
    if (!docId) {
         throw new Error("No backup found in the cloud.");
    }

    const rootRef = doc(firestoreDb, 'schools', docId);
    onProgress?.(`Found backup: ${docId}. Restoring...`);

    await db.transaction('rw', TABLE_NAMES, async () => {
        for (const tableName of TABLE_NAMES) {
            // Skip cloud config table itself to prevent lockout
            if(tableName === 'cloudConfig') continue;

            onProgress?.(`Checking ${tableName}...`);
            
            // Fetch from Cloud FIRST
            const colRef = collection(rootRef, tableName);
            const snapshot = await getDocs(colRef);

            if (!snapshot.empty) {
                // Only clear local table if we actually have data to replace it with
                await db.table(tableName).clear();
                
                const records = snapshot.docs.map((d: any) => {
                    const data = d.data();
                    // Force normalization for critical single-record tables
                    if (tableName === 'schoolDetails') {
                        data.id = 1; 
                    }
                    return data;
                });
                await db.table(tableName).bulkAdd(records);
                console.log(`Restored ${records.length} records to ${tableName}`);
            } else {
                console.log(`No data found for ${tableName} in cloud. Keeping local data.`);
            }
        }
    });

    onProgress?.("Restore completed successfully!");
};
