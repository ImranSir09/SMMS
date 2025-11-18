
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../services/db';
import { SchoolDetails } from '../types';
import { useLiveQuery } from 'dexie-react-hooks';

type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  schoolDetails: SchoolDetails | null;
  refreshSchoolDetails: () => void;
  activeSession: string;
  setActiveSession: (session: string) => void;
  availableSessions: string[];
  refreshSessions: () => Promise<void>;
  isSetupComplete: boolean;
  completeSetup: (initialSession: string) => Promise<void>;
  isLoading: boolean;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSession, _setActiveSession] = useState<string>('');

  const availableSessionsData = useLiveQuery(() => 
    db.sessions.orderBy('name').reverse().toArray().then(sessions => sessions.map(s => s.name)),
    []
  );
  const availableSessions = availableSessionsData || [];
  
  // This is the core fix: A single, robust initialization effect.
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Initialize Theme
        try {
            const savedTheme = localStorage.getItem('theme') as Theme;
            if (savedTheme) setTheme(savedTheme);
        } catch (e) {
            console.warn("Could not access localStorage for theme.", e);
        }

        // 2. Check if setup is complete by looking for any sessions.
        const sessionCount = await db.sessions.count();
        if (sessionCount > 0) {
          setIsSetupComplete(true);
          // 3. If setup is complete, determine the active session.
          const sessions = await db.sessions.orderBy('name').reverse().toArray();
          const sessionNames = sessions.map(s => s.name);
          let storedSession = '';
          try {
            storedSession = localStorage.getItem('activeSession') || '';
          } catch (e) {
            console.warn("Could not get active session from localStorage.", e);
          }
          
          if (storedSession && sessionNames.includes(storedSession)) {
            _setActiveSession(storedSession);
          } else if (sessionNames.length > 0) {
            _setActiveSession(sessionNames[0]); // Default to the latest session
          }
        } else {
          setIsSetupComplete(false);
        }

        // 4. Initialize School Details (with isolated error handling)
        let details: SchoolDetails | null = null;
        try {
            details = await db.schoolDetails.get(1);
            if (!details) {
                await db.schoolDetails.add({
                    id: 1,
                    name: 'My School',
                    address: '123 Education Lane',
                    phone: '555-1234',
                    email: 'contact@myschool.edu',
                    udiseCode: '12345678901',
                    logo: null,
                });
                details = await db.schoolDetails.get(1);
            }
        } catch (detailsError) {
            console.error("Failed to initialize school details. The app will continue.", detailsError);
            details = null; // Ensure details are null if an error occurs
        }
        setSchoolDetails(details || null);

      } catch (error) {
        console.error("Critical error during application initialization:", error);
        // In a real-world app, we might set an error state here to show a crash screen.
      } finally {
        // 5. Signal that loading is complete, allowing the app to render.
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);


  const setActiveSession = (session: string) => {
    try {
      localStorage.setItem('activeSession', session);
    } catch (error) {
      console.warn("Could not set active session in localStorage.", error);
    }
    _setActiveSession(session);
  };
  
  const completeSetup = async (initialSession: string) => {
    if (!initialSession.trim()) return;
    await db.sessions.add({ name: initialSession.trim() });
    setActiveSession(initialSession.trim());
    setIsSetupComplete(true);
  };

  const refreshSessions = async () => {
    const sessions = await db.sessions.orderBy('name').reverse().toArray();
    const sessionNames = sessions.map(s => s.name);
    if (sessions.length > 0 && !sessionNames.includes(activeSession)) {
        setActiveSession(sessionNames[0] || '');
    }
  };

  const refreshSchoolDetails = async () => {
    const details = await db.schoolDetails.get(1);
    setSchoolDetails(details || null);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme', newTheme);
      } catch (error) {
        console.warn("Could not set theme in localStorage.", error);
      }
      return newTheme;
    });
  };
  
  // Memoize the context value to prevent unnecessary re-renders of consumers.
  const contextValue = React.useMemo(() => ({
    theme, 
    toggleTheme, 
    schoolDetails, 
    refreshSchoolDetails,
    activeSession,
    setActiveSession,
    availableSessions,
    refreshSessions,
    isSetupComplete,
    completeSetup,
    isLoading
  }), [theme, schoolDetails, activeSession, availableSessions, isSetupComplete, isLoading]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
