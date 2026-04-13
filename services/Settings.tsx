
import React, { useState, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { db } from '../services/db';
import { SchoolDetails, CloudConfig } from '../types';
import Card from '../components/Card';
import { BuildingIcon, MailIcon, PhoneIcon, HashIcon, MapPinIcon, UploadIcon, DownloadIcon, DatabaseIcon, AlertTriangleIcon, SaveIcon, CloudIcon, UploadCloudIcon, DownloadCloudIcon, UsersIcon } from '../components/icons';
import { useToast } from '../contexts/ToastContext';
import SessionManager from '../components/SessionManager';
import { initFirebase, backupToCloud, restoreFromCloud } from './cloud';

const inputStyle = "p-3 w-full bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";
const buttonStyle = "py-3 px-5 rounded-lg text-sm font-semibold transition-colors";
const primaryButtonStyle = `${buttonStyle} bg-primary text-primary-foreground hover:bg-primary-hover`;

// Masked Configuration (Base64 Encoded) to prevent plain-text exposure
const DEFAULT_MASKED_CONFIG = {
    apiKey: "QUl6YVN5RDFaTXMtelJQS1ZNWGRJb3N4dDk2cE5uY2xpZUNweXQ4",
    authDomain: "c2Nob29sLW1hbmFnZW1lbnQtcHJvLTUyYWJjLmZpcmViYXNlYXBwLmNvbQ==",
    projectId: "c2Nob29sLW1hbmFnZW1lbnQtcHJvLTUyYWJj",
    storageBucket: "c2Nob29sLW1hbmFnZW1lbnQtcHJvLTUyYWJjLmZpcmViYXNlc3RvcmFnZS5hcHA=",
    messagingSenderId: "NzI0NjE4MDI5MTM2",
    appId: "MTo3MjQ2MTgwMjkxMzY6d2ViOjdiY2Y3MmYwODQxYzUzMWJlNDQ5NTU=",
    measurementId: "Ry0zMlRLTTFWUU5O"
};

type Tab = 'profile' | 'cloud' | 'data';

const Settings: React.FC = () => {
    const { schoolDetails, refreshSchoolDetails } = useAppData();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    
    const [details, setDetails] = useState<Partial<SchoolDetails>>({});
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Cloud State
    const [cloudConfig, setCloudConfig] = useState<CloudConfig>({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: ''
    });
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (schoolDetails) {
            setDetails(schoolDetails);
            setLogoPreview(schoolDetails.logo);
        }
        loadCloudConfig();
    }, [schoolDetails]);

    const loadCloudConfig = async () => {
        const config = await db.cloudConfig.get(1);
        if (config) {
            setCloudConfig(config);
            await initFirebase();
        } else {
            // Auto-configure using masked defaults if no config exists
            try {
                const defaultConfig: CloudConfig = {
                    apiKey: atob(DEFAULT_MASKED_CONFIG.apiKey),
                    authDomain: atob(DEFAULT_MASKED_CONFIG.authDomain),
                    projectId: atob(DEFAULT_MASKED_CONFIG.projectId),
                    storageBucket: atob(DEFAULT_MASKED_CONFIG.storageBucket),
                    messagingSenderId: atob(DEFAULT_MASKED_CONFIG.messagingSenderId),
                    appId: atob(DEFAULT_MASKED_CONFIG.appId)
                };
                setCloudConfig(defaultConfig);
                await db.cloudConfig.put({ ...defaultConfig, id: 1 });
                await initFirebase();
                // console.log("Auto-configured cloud settings.");
            } catch (e) {
                console.error("Failed to decode default config", e);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Helper to resize image
    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // Resize to max 300px width/height to save space
                    const MAX_WIDTH = 300;
                    const MAX_HEIGHT = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, width, height); // Ensure transparency
                        ctx.drawImage(img, 0, 0, width, height);
                        // Use PNG to preserve transparency
                        resolve(canvas.toDataURL('image/png'));
                    } else {
                        reject(new Error("Canvas context unavailable"));
                    }
                };
                img.onerror = (err) => reject(err);
                img.src = event.target?.result as string;
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const resizedBase64 = await resizeImage(file);
                setDetails(prev => ({ ...prev, logo: resizedBase64 }));
                setLogoPreview(resizedBase64);
                addToast("Logo processed and ready to save.", "info");
            } catch (error) {
                console.error("Error processing image", error);
                addToast("Failed to process image. Please try another.", "error");
            }
        }
    };
    
    const validateDetails = () => {
        const newErrors: { [key: string]: string } = {};
        if (!details.name?.trim()) newErrors.name = "School Name is required.";
        if (!details.email?.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
            newErrors.email = "Invalid email format.";
        }
        if (!details.phone?.trim()) {
            newErrors.phone = "Phone number is required.";
        } else if (!/^\+?\d{10,}$/.test(details.phone.replace(/[\s-()]/g, ''))) {
            newErrors.phone = "Invalid phone number format.";
        }
        if (!details.udiseCode?.trim()) {
            newErrors.udiseCode = "UDISE Code is required.";
        } else if (!/^\d{11}$/.test(details.udiseCode.trim())) {
            newErrors.udiseCode = "UDISE Code must be 11 digits.";
        }
        if (!details.address?.trim()) newErrors.address = "Address is required.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSaveDetails = async () => {
        if (!validateDetails()) {
            addToast('Please correct the errors before saving.', 'error');
            return;
        }
        if (details.id) {
            await db.schoolDetails.update(details.id, details);
            addToast('School details updated successfully!', 'success');
            refreshSchoolDetails();
        }
    };
    
    const handleSaveCloudConfig = async () => {
        await db.cloudConfig.put({ ...cloudConfig, id: 1 });
        addToast('Cloud configuration saved!', 'success');
        await initFirebase();
    };

    const handleCloudBackup = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            await backupToCloud((msg) => addToast(msg, 'info'));
            addToast('Cloud backup completed successfully!', 'success');
        } catch (error: any) {
            console.error(error);
            addToast(`Backup failed: ${error.message}`, 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCloudRestore = async () => {
        if (isSyncing) return;
        if (!window.confirm("WARNING: Restoring from cloud will OVERWRITE all local data. Are you sure?")) return;
        
        setIsSyncing(true);
        try {
            await restoreFromCloud((msg) => addToast(msg, 'info'));
            addToast('Data restored from cloud! Reloading...', 'success');
            setTimeout(() => window.location.reload(), 2000);
        } catch (error: any) {
            console.error(error);
            addToast(`Restore failed: ${error.message}`, 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleBackup = async () => {
        try {
            const allData: { [key: string]: any[] } = {};
            for(const table of db.tables) {
                allData[table.name] = await table.toArray();
            }
            
            // Use application/octet-stream to prevent browser from opening it
            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            // Updated filename as per request
            link.download = 'smsbackup.json';
            
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);

            addToast('Backup download initiated!', 'success');

        } catch (error) {
            console.error("Backup failed:", error);
            addToast('Backup failed. See console for details.', 'error');
        }
    };

    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if(!window.confirm("Restoring from backup will ERASE all current data. Are you absolutely sure you want to proceed?")) {
            event.target.value = ''; // Reset file input
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result;
                if(typeof text !== 'string') throw new Error("Invalid file content");
                
                const data = JSON.parse(text);

                if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                    throw new Error("Backup file is not in the correct format (must be a JSON object of tables).");
                }
                
                const tableNames = db.tables.map(t => t.name);

                await db.transaction('rw', tableNames, async () => {
                    for (const tableName of tableNames) {
                        if (data[tableName] && Array.isArray(data[tableName])) {
                            const table = db.table(tableName);
                            await table.clear();
                            if (data[tableName].length > 0) {
                                await table.bulkPut(data[tableName]);
                            }
                        } else {
                            console.warn(`Data for table '${tableName}' not found or is in wrong format in backup file. Skipping restore for this table.`);
                        }
                    }
                });

                addToast('Data restored successfully! The application will now reload.', 'success');
                refreshSchoolDetails();
                setTimeout(() => window.location.reload(), 2000);
            } catch (error: any) {
                console.error("Restore failed:", error);
                addToast(`Restore failed: ${error.message}. Make sure it's a valid backup file.`, 'error');
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleResetData = async () => {
        if (window.confirm("DANGER: This will permanently delete ALL data. Are you absolutely sure?")) {
            if (window.confirm("Please confirm again. This action is irreversible and will erase everything.")) {
                try {
                    await db.transaction('rw', db.tables, async () => {
                        for (const table of db.tables) {
                            await table.clear();
                        }
                    });
                    addToast('All data has been reset. The application will now reload.', 'info');
                    setTimeout(() => window.location.reload(), 2000);
                } catch (error) {
                    console.error("Failed to reset data:", error);
                    addToast("An error occurred while resetting the data. See console for details.", 'error');
                }
            }
        }
    };

    const getAutoVersion = () => {
        const d = new Date();
        const year = d.getFullYear().toString().slice(-2);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        return `v${year}.${month}.${day}`;
    };

    const TabButton = ({ id, label, icon }: { id: Tab, label: string, icon: React.ReactNode }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex-1 justify-center ${
                activeTab === id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col gap-4 animate-fade-in h-full">
            {/* Tabs */}
            <div className="bg-card rounded-lg shadow-sm border border-border flex overflow-x-auto">
                <TabButton id="profile" label="Profile" icon={<BuildingIcon className="w-4 h-4"/>} />
                <TabButton id="cloud" label="Cloud Sync" icon={<CloudIcon className="w-4 h-4"/>} />
                <TabButton id="data" label="Data & Session" icon={<DatabaseIcon className="w-4 h-4"/>} />
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <Card className="p-4 animate-fade-in">
                         <div className="flex items-center gap-1.5 text-md font-semibold mb-4 border-b border-border pb-2">
                            <BuildingIcon className="w-5 h-5" />
                            <h2>School Profile Details</h2>
                        </div>
                        <div className="space-y-4 max-w-2xl mx-auto">
                            <div>
                                <label className="block text-xs font-medium text-foreground/80 mb-1">School Name</label>
                                <div className="relative">
                                    <BuildingIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                    <input name="name" value={details.name || ''} onChange={handleChange} className={`${inputStyle} pl-10`} />
                                </div>
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-foreground/80 mb-1">Official Email</label>
                                <div className="relative">
                                    <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                    <input name="email" type="email" value={details.email || ''} onChange={handleChange} className={`${inputStyle} pl-10`} />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-foreground/80 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                        <input name="phone" type="tel" value={details.phone || ''} onChange={handleChange} className={`${inputStyle} pl-10`} />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-foreground/80 mb-1">UDISE Code</label>
                                    <div className="relative">
                                        <HashIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                        <input name="udiseCode" inputMode="numeric" value={details.udiseCode || ''} onChange={handleChange} className={`${inputStyle} pl-10`} />
                                    </div>
                                    {errors.udiseCode && <p className="text-red-500 text-xs mt-1">{errors.udiseCode}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-foreground/80 mb-1">Address</label>
                                <div className="relative">
                                    <MapPinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                    <input name="address" value={details.address || ''} onChange={handleChange} className={`${inputStyle} pl-10`} />
                                </div>
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-foreground/80 mb-1">School Logo</label>
                                <div className="flex items-center gap-3">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" className="w-16 h-16 object-contain rounded-md border border-border p-1" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-md bg-background flex items-center justify-center text-xs text-foreground/50 border border-border">No Logo</div>
                                    )}
                                    <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-lg bg-background border border-dashed border-input hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <UploadIcon className="w-4 h-4 text-foreground/60" />
                                        <span className="text-xs text-foreground/80">Upload Logo (Auto-Resized)</span>
                                        <input type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} className="hidden" />
                                    </label>
                                </div>
                            </div>
                            <button onClick={handleSaveDetails} className={`${primaryButtonStyle} w-full flex items-center justify-center gap-2 mt-4`}><SaveIcon className="w-4 h-4"/> Save Details</button>
                        </div>
                    </Card>
                )}

                {/* Cloud Tab */}
                {activeTab === 'cloud' && (
                    <Card className="p-4 animate-fade-in">
                        <div className="flex items-center gap-1.5 text-md font-semibold mb-4 border-b border-border pb-2 text-blue-600 dark:text-blue-400">
                            <CloudIcon className="w-5 h-5" />
                            <h2>Cloud Configuration & Sync</h2>
                        </div>
                        <div className="space-y-4 max-w-2xl mx-auto">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                                <p className="text-xs text-foreground/80 leading-relaxed">
                                    <strong>Why use Cloud Sync?</strong><br/>
                                    Securely backup your school data to Google Firebase (Free). This allows you to restore your data if you clear your browser cache or switch devices.
                                    <br/><a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-semibold mt-1 inline-block">Get your Firebase Config here</a>.
                                </p>
                            </div>
                            
                            <div className="grid gap-3">
                                <label className="block text-xs font-medium text-foreground/80">Firebase Configuration</label>
                                <input type="password" placeholder="API Key" value={cloudConfig.apiKey} onChange={e => setCloudConfig({...cloudConfig, apiKey: e.target.value})} className={inputStyle} />
                                <input type="password" placeholder="Project ID" value={cloudConfig.projectId} onChange={e => setCloudConfig({...cloudConfig, projectId: e.target.value})} className={inputStyle} />
                                <input type="password" placeholder="App ID" value={cloudConfig.appId} onChange={e => setCloudConfig({...cloudConfig, appId: e.target.value})} className={inputStyle} />
                                <input type="password" placeholder="Auth Domain" value={cloudConfig.authDomain} onChange={e => setCloudConfig({...cloudConfig, authDomain: e.target.value})} className={inputStyle} />
                                <input type="password" placeholder="Storage Bucket" value={cloudConfig.storageBucket} onChange={e => setCloudConfig({...cloudConfig, storageBucket: e.target.value})} className={inputStyle} />
                                <input type="text" placeholder="Messaging Sender ID" value={cloudConfig.messagingSenderId} onChange={e => setCloudConfig({...cloudConfig, messagingSenderId: e.target.value})} className={inputStyle} />
                                <input type="password" placeholder="Measurement ID (Optional)" value={cloudConfig.measurementId || ''} onChange={e => setCloudConfig({...cloudConfig, measurementId: e.target.value})} className={inputStyle} />
                            </div>
                            
                            <button onClick={handleSaveCloudConfig} className="w-full py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950 transition-colors text-xs font-bold">
                                Save Configuration
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 border-t border-border pt-4">
                                <button onClick={handleCloudBackup} disabled={isSyncing || !cloudConfig.apiKey} className={`${buttonStyle} bg-blue-600 text-white flex items-center justify-center gap-2 disabled:opacity-50`}>
                                    <UploadCloudIcon className="w-5 h-5" /> {isSyncing ? 'Syncing...' : 'Backup to Cloud'}
                                </button>
                                <button onClick={handleCloudRestore} disabled={isSyncing || !cloudConfig.apiKey} className={`${buttonStyle} bg-orange-600 text-white flex items-center justify-center gap-2 disabled:opacity-50`}>
                                    <DownloadCloudIcon className="w-5 h-5" /> {isSyncing ? 'Syncing...' : 'Restore from Cloud'}
                                </button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Data Tab */}
                {activeTab === 'data' && (
                    <div className="flex flex-col gap-4 animate-fade-in">
                        <SessionManager />
                        
                        <Card className="p-4">
                            <div className="flex items-center gap-1.5 text-md font-semibold mb-4 border-b border-border pb-2">
                                <DatabaseIcon className="w-5 h-5" />
                                <h2>Offline Backup (JSON)</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button onClick={handleBackup} className={`${buttonStyle} bg-gray-600 text-white flex items-center justify-center gap-2`}><DownloadIcon className="w-4 h-4" /> Download Backup File</button>
                                <label className={`${buttonStyle} bg-green-600 text-white text-center cursor-pointer flex items-center justify-center gap-2`}>
                                    <UploadIcon className="w-4 h-4" />
                                    Restore from File
                                    <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                                </label>
                            </div>
                        </Card>

                        <Card className="p-4 border-red-500/50 bg-red-500/5">
                            <div className="flex items-center gap-1.5 text-md font-semibold mb-2 border-b border-red-500/20 pb-1 text-red-600 dark:text-red-400">
                                <AlertTriangleIcon className="w-5 h-5" />
                                <h2>Danger Zone</h2>
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Factory Reset</p>
                                <p className="text-xs text-foreground/80 mt-1 mb-3">
                                    This action will permanently delete all data, including students, staff, exams, and settings. This action is irreversible.
                                </p>
                                <button
                                    onClick={handleResetData}
                                    className="w-full py-2 px-4 rounded-lg text-sm font-semibold transition-colors bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Reset All Data
                                </button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
            
             <div className="text-center pb-2">
                <p className="text-xs text-foreground/40">App Version: {getAutoVersion()}</p>
             </div>
        </div>
    );
};

export default Settings;
