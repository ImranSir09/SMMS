import React, { useState, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { db } from '../services/db';
import { SchoolDetails } from '../types';
import Card from '../components/Card';

const inputStyle = "p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";
const buttonStyle = "py-2 px-4 rounded-md text-sm font-semibold transition-colors";
const primaryButtonStyle = `${buttonStyle} bg-primary text-primary-foreground hover:bg-primary-hover`;


const Settings: React.FC = () => {
    const { schoolDetails, refreshSchoolDetails } = useAppData();
    const [details, setDetails] = useState<Partial<SchoolDetails>>({});
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        if (schoolDetails) {
            setDetails(schoolDetails);
            setLogoPreview(schoolDetails.logo);
        }
    }, [schoolDetails]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
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

    const handleSaveDetails = async () => {
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

            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(allData, null, 2)
            )}`;
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = `aegis-school-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        } catch (error) {
            console.error("Backup failed:", error);
            alert("Backup failed. See console for details.");
        }
    };

    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if(!window.confirm("Restoring from backup will ERASE all current data. Are you absolutely sure you want to proceed?")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result;
                if(typeof text !== 'string') throw new Error("Invalid file content");
                
                const data = JSON.parse(text);

                await db.transaction('rw', db.tables, async () => {
                    for (const tableName of Object.keys(data)) {
                        // @ts-ignore
                        const table = db[tableName];
                        if (table) {
                            await table.clear();
                            await table.bulkAdd(data[tableName]);
                        }
                    }
                });

                alert('Data restored successfully! The application will now reload.');
                refreshSchoolDetails(); // Refresh context data
                window.location.reload(); // Reload to reflect changes everywhere
            } catch (error) {
                console.error("Restore failed:", error);
                alert("Restore failed. Make sure it's a valid backup file.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-2xl font-bold">Settings</h1>
            
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">School Details</h2>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-1">School Name</label>
                            <input name="name" value={details.name || ''} onChange={handleChange} placeholder="School Name" className={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-1">Address</label>
                            <input name="address" value={details.address || ''} onChange={handleChange} placeholder="Address" className={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-1">Contact Info</label>
                            <input name="contact" value={details.contact || ''} onChange={handleChange} placeholder="Contact Info" className={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-1">School Logo</label>
                            <input type="file" onChange={handleLogoChange} accept="image/*" className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"/>
                            {logoPreview && <img src={logoPreview} alt="Logo Preview" className="mt-2 w-24 h-24 object-cover rounded-full border-2 border-border shadow-sm" />}
                        </div>
                    </div>
                    <button onClick={handleSaveDetails} className={primaryButtonStyle}>Save Details</button>
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Data Management</h2>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleBackup} className={`${buttonStyle} bg-green-600 hover:bg-green-700 text-white`}>Backup All Data</button>
                    <label className={`${buttonStyle} bg-yellow-600 hover:bg-yellow-700 text-white block text-center cursor-pointer`}>
                        Restore from Backup
                        <input type="file" onChange={handleRestore} accept=".json" className="hidden" />
                    </label>
                </div>
                <p className="text-sm mt-4 text-foreground/70">Backup creates a local JSON file of all application data. <span className="font-semibold text-red-500">Restore will overwrite all existing data with the content from a backup file.</span></p>
            </Card>
        </div>
    );
};

export default Settings;