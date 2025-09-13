
import React, { useState, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { db } from '../services/db';
import { SchoolDetails } from '../types';
import Card from '../components/Card';

const inputStyle = "p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-xs transition-colors";
const buttonStyle = "py-2 px-4 rounded-md text-sm font-semibold transition-colors";
const primaryButtonStyle = `${buttonStyle} bg-primary text-primary-foreground hover:bg-primary-hover`;


const Settings: React.FC = () => {
    const { schoolDetails, refreshSchoolDetails } = useAppData();
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
        if (!validateDetails()) return;
        if (details.id) {
            await db.schoolDetails.update(details.id, details);
            alert('School details updated!');
            refreshSchoolDetails();
        }
    };

    const handleBackup = async () => {
        try {
            const allData: { [key: string]: any[] } = {};
            for(const table of db.tables) {
                allData[table.name] = await table.toArray();
            }
            
            // Using Blob for more robust file handling
            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `sms-mobile-backup-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Backup failed:", error);
            alert("Backup failed. See console for details.");
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

                // Define table order to respect dependencies
                const tableOrder = [
                    'schoolDetails', 'students', 'staff', 'exams', 'dailyLogs',
                    'marks', 'studentExamData', 'timetable'
                ];
                
                // Validate that the backup file contains expected table data
                const backupTables = Object.keys(data);
                if (!backupTables.length || !db.tables.some(t => backupTables.includes(t.name))) {
                    throw new Error("This does not appear to be a valid backup file.");
                }

                await db.transaction('rw', db.tables, async () => {
                    // Clear all tables first, in reverse dependency order.
                    // @ts-ignore
                    const tablesToClear = tableOrder.filter(name => db[name]).reverse();
                    for (const tableName of tablesToClear) {
                        // @ts-ignore
                        await db[tableName].clear();
                    }

                    // Import data in dependency order using bulkPut to preserve IDs.
                    for (const tableName of tableOrder) {
                        // @ts-ignore
                        if (data[tableName] && db[tableName]) {
                            // @ts-ignore
                            await db[tableName].bulkPut(data[tableName]);
                        }
                    }
                });

                alert('Data restored successfully! The application will now reload.');
                refreshSchoolDetails(); // Refresh context data
                window.location.reload(); // Reload to reflect changes everywhere
            } catch (error: any) {
                console.error("Restore failed:", error);
                alert(`Restore failed: ${error.message}. Make sure it's a valid backup file for this application.`);
            } finally {
                if (event.target) event.target.value = ''; // Reset file input
            }
        };
        reader.readAsText(file);
    };

    const getAutoVersion = () => {
        const d = new Date();
        const year = d.getFullYear().toString().slice(-2);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        return `v${year}.${month}.${day}`;
    };

    return (
        <div className="h-full flex flex-col gap-4 animate-fade-in">
            <Card className="p-3">
                <h2 className="text-md font-semibold mb-2 border-b border-border pb-1">School Details</h2>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">School Name</label>
                        <input name="name" value={details.name || ''} onChange={handleChange} className={inputStyle} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">Official Email</label>
                        <input name="email" type="email" value={details.email || ''} onChange={handleChange} className={inputStyle} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">Phone Number</label>
                        <input name="phone" value={details.phone || ''} onChange={handleChange} className={inputStyle} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">UDISE Code</label>
                        <input name="udiseCode" value={details.udiseCode || ''} onChange={handleChange} className={inputStyle} />
                        {errors.udiseCode && <p className="text-red-500 text-xs mt-1">{errors.udiseCode}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">Address</label>
                        <input name="address" value={details.address || ''} onChange={handleChange} className={inputStyle} />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="block text-xs font-medium text-foreground/80 mb-1">Logo</label>
                            <input type="file" onChange={handleLogoChange} accept="image/*" className="block w-full text-xs text-foreground file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                        </div>
                        {logoPreview && <img src={logoPreview} alt="Logo Preview" className="w-12 h-12 object-contain rounded-md border border-border" />}
                    </div>
                    <button onClick={handleSaveDetails} className={`${primaryButtonStyle} w-full`}>Save Details</button>
                </div>
            </Card>

            <Card className="p-3">
                <h2 className="text-md font-semibold mb-2 border-b border-border pb-1">Data Management</h2>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleBackup} className={`${buttonStyle} bg-green-600 hover:bg-green-700 text-white`}>Backup</button>
                    <label className={`${buttonStyle} bg-yellow-600 hover:bg-yellow-700 text-white block text-center cursor-pointer`}>
                        Restore
                        <input type="file" onChange={handleRestore} accept=".json" className="hidden" />
                    </label>
                </div>
            </Card>

            <div className="text-center text-xs text-foreground/50 mt-auto py-2">
                Version {getAutoVersion()}
            </div>
        </div>
    );
};

export default Settings;
