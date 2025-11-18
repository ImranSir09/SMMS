
import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { SchoolIcon, UserIcon, HashIcon, ArrowRightIcon } from '../components/icons';

const Login: React.FC = () => {
    const { login, schoolDetails } = useAppData();
    const [username, setUsername] = useState('');
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
                    <p className="text-sm text-foreground/60 mt-1">Welcome back! Please login to continue.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
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
                </form>
                
                <div className="mt-6 text-center">
                    <p className="text-[10px] text-foreground/40">School Management Pro V2</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
