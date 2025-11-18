
import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { SchoolIcon, UserIcon, HashIcon, ArrowRightIcon, KeyIcon, ArrowLeftIcon } from '../components/icons';
import { db } from '../services/db';
import { hashString } from '../utils/crypto';

const Login: React.FC = () => {
    const { login, schoolDetails } = useAppData();
    
    // Login State
    const [username, setUsername] = useState('');
    const [key, setKey] = useState('');
    
    // Reset State
    const [isResetMode, setIsResetMode] = useState(false);
    const [masterKey, setMasterKey] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newKey, setNewKey] = useState('');

    // Common State
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const success = await login(username, key);
            if (!success) {
                setError('Invalid username or security key.');
            }
        } catch (err) {
            setError('An error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsLoading(true);

        try {
            // Hardcoded master key for recovery as per previous setup logic
            if (masterKey !== 'IMRAN-ZONE') {
                setError('Invalid Master Activation Key. Cannot reset.');
                setIsLoading(false);
                return;
            }

            if (newUsername.length < 3 || newKey.length < 3) {
                setError('Username and Key must be at least 3 characters.');
                setIsLoading(false);
                return;
            }

            // Hash the new key before saving
            const hashedNewKey = await hashString(newKey);

            // Perform Reset
            await db.transaction('rw', db.user, async () => {
                await db.user.clear(); // Remove old credentials
                await db.user.add({ username: newUsername, accessKey: hashedNewKey });
            });

            setSuccessMsg('Credentials reset successfully! Logging in...');
            
            // Auto-login after short delay (login will hash input internally)
            setTimeout(async () => {
                await login(newUsername, newKey);
            }, 1500);

        } catch (err) {
            console.error(err);
            setError('Failed to reset credentials.');
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground p-4 animate-fade-in relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-xl z-10 relative">
                <div className="text-center mb-8">
                    {schoolDetails?.logo ? (
                        <img src={schoolDetails.logo} alt="Logo" className="h-20 w-auto mx-auto mb-4 object-contain" />
                    ) : (
                        <div className="mx-auto h-16 w-16 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                            <SchoolIcon className="w-8 h-8 text-primary" />
                        </div>
                    )}
                    <h1 className="text-2xl font-bold">{schoolDetails?.name || 'School Management'}</h1>
                    <p className="text-sm text-foreground/60 mt-1">
                        {isResetMode ? 'Reset Access Credentials' : 'Welcome back! Please login to continue.'}
                    </p>
                </div>

                {!isResetMode ? (
                    // LOGIN FORM
                    <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-xs font-semibold text-foreground/70 mb-1 uppercase tracking-wide">Username</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground/70 mb-1 uppercase tracking-wide">Security Key</label>
                            <div className="relative">
                                <HashIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                                <input 
                                    type="password" 
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    className="w-full pl-10 p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    placeholder="Enter security key"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-xs text-center font-medium">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading || !username || !key}
                            className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Verifying...' : 'Login'} 
                            {!isLoading && <ArrowRightIcon className="w-5 h-5" />}
                        </button>
                        
                        <div className="text-center mt-4">
                            <button 
                                type="button" 
                                onClick={() => { setIsResetMode(true); setError(''); }}
                                className="text-xs text-primary/80 hover:text-primary font-semibold hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </form>
                ) : (
                    // RESET FORM
                    <form onSubmit={handleReset} className="space-y-4 animate-fade-in">
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-700 dark:text-yellow-400 text-xs mb-4">
                            <p>Enter the <strong>Master Activation Key</strong> provided by the developer to reset your credentials.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground/70 mb-1 uppercase tracking-wide">Master Activation Key</label>
                            <div className="relative">
                                <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                                <input 
                                    type="text" 
                                    value={masterKey}
                                    onChange={(e) => setMasterKey(e.target.value)}
                                    className="w-full pl-10 p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    placeholder="XXXX-XXXX"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-foreground/70 mb-1 uppercase tracking-wide">New Username</label>
                                <input 
                                    type="text" 
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="New Username"
                                    required
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-semibold text-foreground/70 mb-1 uppercase tracking-wide">New Key</label>
                                <input 
                                    type="text" 
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="New Key"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-xs text-center font-medium">
                                {error}
                            </div>
                        )}
                         {successMsg && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-xs text-center font-medium">
                                {successMsg}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading || !masterKey || !newUsername || !newKey}
                            className="w-full py-3.5 rounded-lg bg-red-600 text-white font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Resetting...' : 'Reset & Login'}
                        </button>
                        
                         <div className="text-center mt-2">
                            <button 
                                type="button" 
                                onClick={() => { setIsResetMode(false); setError(''); }}
                                className="text-xs text-foreground/60 hover:text-foreground flex items-center justify-center gap-1 mx-auto"
                            >
                                <ArrowLeftIcon className="w-3 h-3" /> Back to Login
                            </button>
                        </div>
                    </form>
                )}
                
                <div className="mt-6 text-center">
                    <p className="text-[10px] text-foreground/40">School Management Pro V2</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
