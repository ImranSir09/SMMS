
import React from 'react';
import Card from '../components/Card';
import { BookIcon, ArrowLeftIcon } from '../components/icons';
import { useNavigate } from 'react-router-dom';

const Terms: React.FC = () => {
    const navigate = useNavigate();

    return (
    <div className="flex flex-col gap-4 animate-fade-in p-1 h-full">
        <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Terms & Conditions</h1>
        </div>

      <Card className="p-6 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-4 border-b border-border pb-2 flex-shrink-0">
           <div className="p-2 bg-primary/10 rounded-full text-primary">
             <BookIcon className="w-6 h-6" />
           </div>
           <h2 className="text-lg font-bold">User Agreement</h2>
        </div>
        
        <div className="space-y-6 text-sm text-foreground/80 leading-relaxed overflow-y-auto pr-2 flex-1">
            <section>
                <h3 className="font-bold text-foreground text-base mb-2">1. Introduction</h3>
                <p>Welcome to School Management Pro V2. By using this application, you agree to comply with and be bound by the following terms and conditions of use.</p>
            </section>

            <section>
                <h3 className="font-bold text-foreground text-base mb-2">2. Offline-First Policy & Data Privacy</h3>
                <p>This application operates on an "Offline-First" architecture. All data entered (student records, marks, school details) is stored locally on your device's browser database (IndexedDB).</p>
                <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
                    <li><strong>No Cloud Storage:</strong> The developer does not store, access, or backup your data on any remote server.</li>
                    <li><strong>Data Responsibility:</strong> You are solely responsible for the safety, backup, and security of the data stored on your device.</li>
                    <li><strong>Backup:</strong> We strongly recommend using the "Backup Data" feature in Settings regularly to save a JSON copy of your database externally.</li>
                </ul>
            </section>

            <section>
                <h3 className="font-bold text-foreground text-base mb-2">3. User Accounts</h3>
                <p>The administrator account created during setup is local to this device. If you lose your access key or username, the "Forgot Password" feature relies on the Master Activation Key provided by the developer.</p>
            </section>

            <section>
                <h3 className="font-bold text-foreground text-base mb-2">4. License & Usage</h3>
                <p>This software is licensed for use by educational institutions for management purposes. Reverse engineering, redistribution, or unauthorized modification of the source code is prohibited.</p>
            </section>

            <section>
                <h3 className="font-bold text-foreground text-base mb-2">5. Limitation of Liability</h3>
                <p>The developer shall not be held liable for any data loss, corruption, or damages arising from the use or inability to use this application. The software is provided "as is" without warranties of any kind.</p>
            </section>
             <section>
                <h3 className="font-bold text-foreground text-base mb-2">6. Contact</h3>
                <p>For support, activation keys, or queries, please contact the developer: Imran Gani Mugloo (Teacher Zone Vailoo).</p>
            </section>
        </div>
      </Card>
    </div>
  );
};

export default Terms;
