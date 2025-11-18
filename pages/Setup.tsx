
import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { SchoolIcon, ArrowRightIcon, BuildingIcon, UserIcon, HashIcon, CalendarIcon, CheckCircleIcon, KeyIcon } from '../components/icons';
import { SchoolDetails, UserProfile } from '../types';

type Step = 'activation' | 'school' | 'security' | 'session';

const Setup: React.FC = () => {
    const { completeSetup } = useAppData();
    const [currentStep, setCurrentStep] = useState<Step>('activation');
    const [isLoading, setIsLoading] = useState(false);

    // Step 0: Activation
    const [activationKey, setActivationKey] = useState('');
    const [activationError, setActivationError] = useState('');

    // Step 1: School Data
    const [schoolData, setSchoolData] = useState<SchoolDetails>({
        name: '',
        address: '',
        phone: '',
        email: '',
        udiseCode: '',
        logo: null
    });

    // Step 2: Security Data
    const [authData, setAuthData] = useState<UserProfile>({
        username: '',
        accessKey: ''
    });

    // Step 3: Session
    const [sessionName, setSessionName] = useState('');

    const handleSchoolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSchoolData({ ...schoolData, [e.target.name]: e.target.value });
    };

    const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAuthData({ ...authData, [e.target.name]: e.target.value });
    };

    const handleNext = (nextStep: Step) => {
        setCurrentStep(nextStep);
    };

    const handleActivation = () => {
        if (activationKey === 'IMRAN-ZONE') {
             setCurrentStep('school');
        } else {
             setActivationError('Invalid activation key. Contact developer.');
        }
    };

    const handleFinalSubmit = async () => {
        if (sessionName.trim()) {
            setIsLoading(true);
            try {
                await completeSetup(sessionName.trim(), schoolData, authData);
            } catch (error) {
                console.error("Setup failed", error);
                setIsLoading(false);
            }
        }
    };
    
    const inputClass = "w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm";
    const labelClass = "block text-xs font-bold text-foreground/70 mb-1 uppercase tracking-wider";

    const renderActivationStep = () => (
        <div className="space-y-4 animate-fade-in">
             <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600 mb-3">
                    <KeyIcon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold">Product Activation</h2>
                <p className="text-xs text-foreground/60">This software is protected. Enter key to activate.</p>
            </div>
            <div>
                <label className={labelClass}>Activation Key <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    value={activationKey} 
                    onChange={(e) => { setActivationKey(e.target.value); setActivationError(''); }} 
                    className={`${inputClass} text-center font-mono tracking-widest uppercase`} 
                    placeholder="XXXX-XXXX" 
                />
                {activationError && <p className="text-red-500 text-xs mt-2 text-center">{activationError}</p>}
            </div>
            <button 
                onClick={handleActivation} 
                disabled={!activationKey}
                className="w-full py-3 mt-4 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
                Activate Software
            </button>
        </div>
    );

    const renderSchoolStep = () => (
        <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full bg-blue-100 text-blue-600 mb-3">
                    <BuildingIcon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold">School Details</h2>
                <p className="text-xs text-foreground/60">Enter your institution's official details.</p>
            </div>
            <div>
                <label className={labelClass}>School Name <span className="text-red-500">*</span></label>
                <input name="name" value={schoolData.name} onChange={handleSchoolChange} className={inputClass} placeholder="e.g. Govt High School" required />
            </div>
            <div>
                <label className={labelClass}>Address <span className="text-red-500">*</span></label>
                <input name="address" value={schoolData.address} onChange={handleSchoolChange} className={inputClass} placeholder="e.g. 123 Education Lane" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>UDISE Code</label>
                    <input name="udiseCode" value={schoolData.udiseCode} onChange={handleSchoolChange} className={inputClass} placeholder="11 digits" />
                </div>
                <div>
                    <label className={labelClass}>Phone</label>
                    <input name="phone" type="tel" value={schoolData.phone} onChange={handleSchoolChange} className={inputClass} placeholder="Contact No" />
                </div>
            </div>
             <div>
                <label className={labelClass}>Email</label>
                <input name="email" type="email" value={schoolData.email} onChange={handleSchoolChange} className={inputClass} placeholder="school@email.com" />
            </div>
            <button 
                onClick={() => handleNext('security')} 
                disabled={!schoolData.name || !schoolData.address}
                className="w-full py-3 mt-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next Step
            </button>
        </div>
    );

    const renderSecurityStep = () => (
        <div className="space-y-4 animate-fade-in">
             <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full bg-purple-100 text-purple-600 mb-3">
                    <UserIcon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold">Admin Security</h2>
                <p className="text-xs text-foreground/60">Create a secure login for the administrator.</p>
            </div>
            <div>
                <label className={labelClass}>Username <span className="text-red-500">*</span></label>
                <input name="username" value={authData.username} onChange={handleAuthChange} className={inputClass} placeholder="e.g. admin" required />
            </div>
            <div>
                <label className={labelClass}>Security Key (Password) <span className="text-red-500">*</span></label>
                <input name="accessKey" type="password" value={authData.accessKey} onChange={handleAuthChange} className={inputClass} placeholder="Create a strong key" required />
            </div>
            <div className="flex gap-3 mt-6">
                <button onClick={() => setCurrentStep('school')} className="flex-1 py-3 rounded-lg border border-border font-semibold hover:bg-secondary transition-colors">Back</button>
                <button 
                    onClick={() => handleNext('session')} 
                    disabled={!authData.username || !authData.accessKey}
                    className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                    Next Step
                </button>
            </div>
        </div>
    );

    const renderSessionStep = () => (
        <div className="space-y-4 animate-fade-in">
             <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full bg-green-100 text-green-600 mb-3">
                    <CalendarIcon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold">Academic Session</h2>
                <p className="text-xs text-foreground/60">Set the current academic year.</p>
            </div>
            <div>
                <label className={labelClass}>Session Name <span className="text-red-500">*</span></label>
                 <input 
                    type="text" 
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g. 2024-25"
                    className={`${inputClass} text-center text-lg font-bold`}
                />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-xs text-yellow-800 mt-4">
                <p><strong>Review Details:</strong></p>
                <p>School: {schoolData.name}</p>
                <p>Admin: {authData.username}</p>
            </div>

            <div className="flex gap-3 mt-4">
                <button onClick={() => setCurrentStep('security')} className="flex-1 py-3 rounded-lg border border-border font-semibold hover:bg-secondary transition-colors">Back</button>
                <button 
                    onClick={handleFinalSubmit} 
                    disabled={!sessionName.trim() || isLoading}
                    className="flex-[2] py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? 'Setting up...' : (
                        <>Complete Setup <CheckCircleIcon className="w-5 h-5" /></>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground p-4 relative z-10 overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-xl z-10 flex flex-col max-h-[90vh] overflow-y-auto">
                
                {/* Progress Bar - Only visible after activation */}
                {currentStep !== 'activation' && (
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className={`h-2 flex-1 rounded-l-full ${currentStep === 'school' ? 'bg-primary' : 'bg-green-500'}`}></div>
                        <div className={`h-2 flex-1 ${currentStep === 'school' ? 'bg-border' : (currentStep === 'security' ? 'bg-primary' : 'bg-green-500')}`}></div>
                        <div className={`h-2 flex-1 rounded-r-full ${currentStep === 'session' ? 'bg-primary' : 'bg-border'}`}></div>
                    </div>
                )}

                {currentStep === 'activation' && renderActivationStep()}
                {currentStep === 'school' && renderSchoolStep()}
                {currentStep === 'security' && renderSecurityStep()}
                {currentStep === 'session' && renderSessionStep()}
            </div>
            
            <p className="text-xs text-foreground/40 mt-6">School Management Pro V2 Setup</p>
        </div>
    );
};

export default Setup;
