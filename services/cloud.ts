
import { db } from './db';

// Use 'any' to avoid static type imports from firebase which might trigger loading
let firebaseApp: any = null;
let firestoreDb: any = null;
let firestoreUtils: any = null; // Will hold { collection, writeBatch, doc, getDocs, getDoc }

const TABLE_NAMES = [
    'schoolDetails', 'students', 'exams', 'marks', 'dailyLogs', 
    'hpcReports', 'studentExamData', 'sbaReports', 
    'detailedFormativeAssessments', 'sessions', 
    'studentSessionInfo', 'user'
];

const FIXED_BACKUP_ID = 'default_backup';

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
                const { getFirestore, collection, writeBatch, doc, getDocs, getDoc } = await import('firebase/firestore');
                
                firestoreUtils = { collection, writeBatch, doc, getDocs, getDoc };

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

// Helper to determine the document ID to use for backup/restore
const resolveDocId = async (mode: 'backup' | 'restore'): Promise<string> => {
    // 1. Always prefer the fixed ID for new backups
    if (mode === 'backup') {
        return FIXED_BACKUP_ID;
    }

    // 2. For restore, check if the fixed ID exists first
    const { doc, getDoc, collection, getDocs } = firestoreUtils;
    
    // Check if 'schoolDetails' exists under 'default_backup' to verify existence
    const defaultRef = collection(doc(firestoreDb, 'schools', FIXED_BACKUP_ID), 'schoolDetails');
    const defaultSnapshot = await getDocs(defaultRef);
    
    if (!defaultSnapshot.empty) {
        return FIXED_BACKUP_ID;
    }

    // 3. Fallback: Search for legacy backups (random IDs or usernames)
    const schoolsCol = collection(firestoreDb, 'schools');
    const rootSnapshot = await getDocs(schoolsCol);
    
    if (!rootSnapshot.empty) {
        // Return the first available document ID
        console.log("Found legacy backup:", rootSnapshot.docs[0].id);
        return rootSnapshot.docs[0].id;
    }

    // Default to fixed ID if nothing found (will result in empty restore, which is handled)
    return FIXED_BACKUP_ID;
};

export const backupToCloud = async (onProgress?: (msg: string) => void): Promise<void> => {
    if (!firestoreDb || !firestoreUtils) {
        const initialized = await initFirebase();
        if (!initialized) throw new Error("Cloud connection could not be established. Check internet or settings.");
    }

    const { collection, writeBatch, doc } = firestoreUtils;

    // Always write to the fixed ID to ensure consistency across resets/renames
    const docId = FIXED_BACKUP_ID;
    const rootRef = doc(firestoreDb, 'schools', docId);

    onProgress?.(`Preparing backup...`);

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

    onProgress?.("Searching for backup...");
    
    const docId = await resolveDocId('restore');
    const rootRef = doc(firestoreDb, 'schools', docId);
    
    onProgress?.(`Found backup source. Restoring...`);

    let hasRestoredData = false;

    // Process tables sequentially. 
    for (const tableName of TABLE_NAMES) {
        if (tableName === 'cloudConfig') continue;

        onProgress?.(`Checking ${tableName}...`);
        
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
                    // Ensure user always has ID 1 (or whatever logic you prefer, but consistent)
                    if (tableName === 'user' && data.id) {
                        // We keep the ID from cloud, but ensure we don't have conflicts if logic relies on ID 1
                    }
                    return data;
                });

                // 2. Write to Local DB in a dedicated, fast transaction
                // Only clear and write if we actually found data for this table
                await db.transaction('rw', db.table(tableName), async () => {
                    await db.table(tableName).clear();
                    await db.table(tableName).bulkAdd(records);
                });
                
                hasRestoredData = true;
                // console.log(`Restored ${records.length} records to ${tableName}`);
            }
        } catch (err: any) {
            console.error(`Failed to restore table ${tableName}:`, err);
            throw new Error(`Failed to restore ${tableName}. Please check your connection.`);
        }
    }

    if (!hasRestoredData) {
        throw new Error("No data found in the cloud to restore.");
    }

    onProgress?.("Restore completed successfully!");
};
