
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs, Firestore } from 'firebase/firestore';
import { db } from './db';
import { CloudConfig } from '../types';

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

const TABLE_NAMES = [
    'schoolDetails', 'students', 'exams', 'marks', 'dailyLogs', 
    'hpcReports', 'studentExamData', 'sbaReports', 
    'detailedFormativeAssessments', 'sessions', 
    'studentSessionInfo', 'user'
];

export const initFirebase = async () => {
    try {
        const config = await db.cloudConfig.get(1);
        if (config) {
            // Check if config is valid
            if (!config.apiKey || !config.projectId) return false;

            if (!firebaseApp) {
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
        console.error("Error initializing Firebase:", error);
        return false;
    }
};

export const backupToCloud = async (onProgress?: (msg: string) => void): Promise<void> => {
    if (!firestoreDb) {
        const initialized = await initFirebase();
        if (!initialized) throw new Error("Cloud configuration missing or invalid.");
    }

    // Get a unique identifier for the school document (using user's username or generic ID)
    const user = await db.user.get(1);
    const docId = user?.username || 'school_backup';
    const rootRef = doc(firestoreDb!, 'schools', docId);

    onProgress?.("Starting backup...");

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
            const batch = writeBatch(firestoreDb!);
            const colRef = collection(rootRef, tableName);
            
            chunk.forEach((record: any) => {
                // Use record ID as document ID if possible for idempotency
                const recordId = record.id ? String(record.id) : null;
                const docRef = recordId ? doc(colRef, recordId) : doc(colRef);
                // Sanitize undefined values (Firestore doesn't like them)
                const sanitizedRecord = JSON.parse(JSON.stringify(record));
                batch.set(docRef, sanitizedRecord);
            });

            await batch.commit();
        }
    }

    onProgress?.("Backup completed successfully!");
};

export const restoreFromCloud = async (onProgress?: (msg: string) => void): Promise<void> => {
     if (!firestoreDb) {
        const initialized = await initFirebase();
        if (!initialized) throw new Error("Cloud configuration missing or invalid.");
    }

    const user = await db.user.get(1);
    const docId = user?.username || 'school_backup';
    const rootRef = doc(firestoreDb!, 'schools', docId);

    onProgress?.("Starting restore...");

    await db.transaction('rw', TABLE_NAMES, async () => {
        for (const tableName of TABLE_NAMES) {
            // Skip cloud config table itself to prevent lockout
            if(tableName === 'cloudConfig') continue;

            onProgress?.(`Restoring ${tableName}...`);
            
            // Clear local table
            await db.table(tableName).clear();

            // Fetch from Cloud
            const colRef = collection(rootRef, tableName);
            const snapshot = await getDocs(colRef);

            if (!snapshot.empty) {
                const records = snapshot.docs.map(doc => doc.data());
                await db.table(tableName).bulkAdd(records);
            }
        }
    });

    onProgress?.("Restore completed successfully!");
};
