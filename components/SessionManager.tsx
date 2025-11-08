import React, { useState } from 'react';
import { db } from '../services/db';
import { useAppData } from '../hooks/useAppData';
import { useToast } from '../contexts/ToastContext';
import Card from './Card';
import { UsersIcon, AlertTriangleIcon } from './icons';

const inputStyle = "p-3 w-full bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";
const buttonStyle = "py-3 px-5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60";

const promoteClass = (className: string): string | null => {
    if (className === '8th') return null; // Graduated
    if (className === 'Balvatika') return '1st';
    if (className === 'PP2') return 'Balvatika';
    if (className === 'PP1') return 'PP2';
    
    const match = className.match(/(\d+)/);
    if (match) {
        const num = parseInt(match[1], 10);
        const newNum = num + 1;
        let suffix = 'th';
        if (newNum % 10 === 1 && newNum % 100 !== 11) suffix = 'st';
        else if (newNum % 10 === 2 && newNum % 100 !== 12) suffix = 'nd';
        else if (newNum % 10 === 3 && newNum % 100 !== 13) suffix = 'rd';
        return `${newNum}${suffix}`;
    }
    return className;
};


const SessionManager: React.FC = () => {
    const { activeSession, availableSessions, setActiveSession, refreshSessions } = useAppData();
    const { addToast } = useToast();
    const [newSessionName, setNewSessionName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePromoteStudents = async () => {
        if (!newSessionName.trim()) {
            addToast('Please enter a name for the new session.', 'error');
            return;
        }
        if (availableSessions.includes(newSessionName)) {
            addToast('This session name already exists.', 'error');
            return;
        }
        if (!window.confirm(`Are you sure you want to promote students from '${activeSession}' to a new session called '${newSessionName}'? This action is irreversible.`)) {
            return;
        }

        setIsLoading(true);
        addToast('Promotion process started... This may take a moment.', 'info');

        try {
            // Get all student session info from the active session
            const currentSessionInfo = await db.studentSessionInfo.where({ session: activeSession }).toArray();
            
            if (currentSessionInfo.length === 0) {
                throw new Error(`No students found in the active session '${activeSession}'.`);
            }

            const newSessionRecords = [];
            let promotedCount = 0;
            let graduatedCount = 0;

            for (const record of currentSessionInfo) {
                const newClassName = promoteClass(record.className);
                if (newClassName) {
                    newSessionRecords.push({
                        ...record,
                        id: undefined, // Let Dexie auto-increment the ID
                        session: newSessionName,
                        className: newClassName,
                    });
                    promotedCount++;
                } else {
                    graduatedCount++;
                }
            }

            // Perform DB operations in a transaction
            await db.transaction('rw', db.sessions, db.studentSessionInfo, async () => {
                // Add the new session
                await db.sessions.add({ name: newSessionName });
                // Add the new student session records
                await db.studentSessionInfo.bulkAdd(newSessionRecords);
            });
            
            addToast(`Promotion successful! ${promotedCount} students promoted, ${graduatedCount} graduated.`, 'success');
            setNewSessionName('');
            await refreshSessions(); // Refresh the session list in context
            setActiveSession(newSessionName); // Switch to the new session

        } catch (error: any) {
            console.error('Promotion failed:', error);
            addToast(`Promotion failed: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-3">
            <div className="flex items-center gap-1.5 text-md font-semibold mb-2 border-b border-border pb-1">
                <UsersIcon className="w-5 h-5" />
                <h2>Session Management</h2>
            </div>
            <div className="space-y-4">
                <div>
                    <p className="text-sm font-medium">Promote Students to New Session</p>
                    <p className="text-xs text-foreground/80 mt-1">
                        This will copy all students from the current session (<strong className="text-primary">{activeSession}</strong>) into a new session, automatically promoting them to the next class.
                    </p>
                </div>
                <div>
                    <label htmlFor="new-session" className="block text-xs font-medium text-foreground/80 mb-1">New Session Name</label>
                    <input
                        id="new-session"
                        type="text"
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        placeholder="e.g., 2025-26"
                        className={inputStyle}
                    />
                </div>
                <div className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 dark:text-red-400">
                        <strong>Warning:</strong> This is a major, irreversible action. It will create records for all students in the new session. Proceed with caution.
                    </p>
                </div>
                <button 
                    onClick={handlePromoteStudents}
                    disabled={isLoading}
                    className={`${buttonStyle} w-full bg-primary text-primary-foreground hover:bg-primary-hover`}
                >
                    {isLoading ? 'Promoting...' : `Promote Students from ${activeSession}`}
                </button>
            </div>
        </Card>
    );
};

export default SessionManager;