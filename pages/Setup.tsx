
import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { SchoolIcon, ArrowRightIcon } from '../components/icons';

const Setup: React.FC = () => {
    const [sessionName, setSessionName] = useState('');
    const { completeSetup } = useAppData();
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = async () => {
        if (sessionName.trim()) {
            setIsLoading(true);
            try {
                await completeSetup(sessionName.trim());
            } catch (error) {
                console.error("Setup failed", error);
                setIsLoading(false);
            }
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleStart();
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground p-4 animate-fade-in">
            <div className="text-center max-w-sm w-full">
                <div className="mx-auto h-16 w-16 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                    <SchoolIcon className="w-9 h-9 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Welcome to School Management Pro</h1>
                <p className="text-foreground/70 mt-2">
                    To get started, please enter the name of your first academic session.
                </p>
                
                <div className="mt-8">
                    <input 
                        type="text" 
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="e.g., 2024-25"
                        className="p-3 w-full bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg font-semibold"
                        autoFocus
                    />
                </div>

                <div className="mt-4">
                    <button 
                        onClick={handleStart} 
                        disabled={!sessionName.trim() || isLoading}
                        className="w-full py-3 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-md font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {isLoading ? 'Setting up...' : (
                            <>
                                Get Started <ArrowRightIcon className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Setup;
