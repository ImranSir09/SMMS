import React, { useState, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { db } from '../services/db';
import { SchoolDetails } from '../types';
import Card from '../components/Card';
import { BuildingIcon, MailIcon, PhoneIcon, HashIcon, MapPinIcon, UploadIcon, DownloadIcon, DatabaseIcon, AlertTriangleIcon, SaveIcon } from '../components/icons';
import { useToast } from '../contexts/ToastContext';
import SessionManager from '../components/SessionManager';

const inputStyle = "p-3 w-full bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";
const buttonStyle = "py-3 px-5 rounded-lg text-sm font-semibold transition-colors";
const primaryButtonStyle = `${buttonStyle} bg-primary text-primary-foreground hover:bg-primary-hover`;


const Settings: React.FC = () => {
    const { schoolDetails, refreshSchoolDetails } = useAppData();
    const { addToast } = useToast();
    const [details, setDetails] = useState<Partial<SchoolDetails>>({});
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (schoolDetails) {
            setDetails(schoolDetails);
            setLogoPreview(schoolDetails.logo);
        }
    }, [schoolDetails]);

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

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setDetails(prev => ({ ...prev, logo: base64String }));
                setLogoPreview(base64String);
            };
            reader.readAsDataURL(file);
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

    const handleBackup = async () => {
        try {
            const allData: { [key: string]: any[] } = {};
            for(const table of db.tables) {
                allData[table.name] = await table.toArray();
            }
            
            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `sms-mobile-backup-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            
            // FIX: Delay cleanup to ensure download starts in all environments.
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
            {/* Left Column */}
            <div className="flex flex-col gap-4">
                <Card className="p-3">
                    <div className="flex items-center gap-1.5 text-md font-semibold mb-2 border-b border-border pb-1">
                        <BuildingIcon className="w-5 h-5" />
                        <h2>School Details</h2>
                    </div>
                    <div className="space-y-3">
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
                                <input name="udiseCode" value={details.udiseCode || ''} onChange={handleChange} className={`${inputStyle} pl-10`} />
                            </div>
                            {errors.udiseCode && <p className="text-red-500 text-xs mt-1">{errors.udiseCode}</p>}
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
                                <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-lg bg-background border border-dashed border-input hover:bg-black/5 dark:hover:bg-white/5">
                                    <UploadIcon className="w-4 h-4 text-foreground/60" />
                                    <span className="text-xs text-foreground/80">Upload Logo</span>
                                    <input type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} className="hidden" />
                                </label>
                            </div>
                        </div>
                        <button onClick={handleSaveDetails} className={`${primaryButtonStyle} w-full flex items-center justify-center gap-2`}><SaveIcon className="w-4 h-4"/> Save Details</button>
                    </div>
                </Card>
            </div>
            {/* Right Column */}
            <div className="flex flex-col gap-4">
                <SessionManager />
                <Card className="p-3">
                    <div className="flex items-center gap-1.5 text-md font-semibold mb-2 border-b border-border pb-1">
                        <DatabaseIcon className="w-5 h-5" />
                        <h2>Data Management</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleBackup} className={`${buttonStyle} bg-blue-600 text-white flex items-center justify-center gap-2`}><DownloadIcon className="w-4 h-4" /> Backup Data</button>
                        <label className={`${buttonStyle} bg-green-600 text-white text-center cursor-pointer flex items-center justify-center gap-2`}>
                            <UploadIcon className="w-4 h-4" />
                            Restore Data
                            <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                        </label>
                    </div>
                </Card>
                <Card className="p-3 border-red-500/50 bg-red-500/5">
                    <div className="flex items-center gap-1.5 text-md font-semibold mb-2 border-b border-red-500/20 pb-1 text-red-600 dark:text-red-400">
                        <AlertTriangleIcon className="w-5 h-5" />
                        <h2>Danger Zone</h2>
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Reset All Application Data</p>
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
                 <Card className="p-3 text-center">
                    <p className="text-xs text-foreground/60">App Version: {getAutoVersion()}</p>
                 </Card>
            </div>
        </div>
    );
};

export default Settings;