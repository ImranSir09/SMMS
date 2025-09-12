import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';

export interface WizardStepProps {
  data: any;
  setData: (data: any) => void;
  onNext?: () => void;
  errors?: { [key: string]: string } | null;
}

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  steps: { 
    title: string; 
    content: React.ComponentType<WizardStepProps>;
    validate?: (data: any) => { [key: string]: string } | null;
  }[];
  initialData: any;
  onSave: (data: any) => void;
}

const Wizard: React.FC<WizardProps> = ({ isOpen, onClose, title, steps, initialData, onSave }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState<{ [key: string]: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setFormData(initialData || {});
      setErrors(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleNext = () => {
    const validate = steps[currentStep].validate;
    if (validate) {
      const validationErrors = validate(formData);
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return; 
      }
    }
    
    setErrors(null);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onSave(formData);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors(null);
    }
  };

  const CurrentStepComponent = steps[currentStep].content;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-center items-center animate-fade-in p-4">
      <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="bg-card text-card-foreground border border-border rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[95vh]">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-foreground/70">Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </header>
        <main className="p-6 overflow-y-auto flex-1">
          <CurrentStepComponent data={formData} setData={setFormData} onNext={handleNext} errors={errors} />
        </main>
        <footer className="flex items-center justify-between p-4 border-t border-border bg-background/50 rounded-b-lg">
          <div>
            {currentStep > 0 && (
              <button type="button" onClick={handlePrev} className="py-2 px-4 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white text-sm font-semibold transition-colors">
                Previous
              </button>
            )}
          </div>
          <button type="submit" className={`py-2 px-4 rounded-md text-sm font-semibold transition-colors ${isLastStep ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-primary hover:bg-primary-hover text-primary-foreground'}`}>
            {isLastStep ? 'Save' : 'Next'}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default Wizard;