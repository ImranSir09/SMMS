
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../services/db';
import { SchoolDetails, UserProfile } from '../types';
import { useLiveQuery } from 'dexie-react-hooks';
import { hashString } from '../utils/crypto';

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
  completeSetup: (initialSession: string, schoolDetails: SchoolDetails, user: UserProfile) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, key: string) => Promise<boolean>;
  logout: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSession, _setActiveSession] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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
        const userCount = await db.user.count();

        if (sessionCount > 0) {
          setIsSetupComplete(true);
          
          // Backward compatibility: If sessions exist but no user, auto-login (for old versions)
          if (userCount === 0) {
             setIsAuthenticated(true);
          } else {
             // For secured apps, check session storage or require fresh login
             try {
                 const sessionAuth = sessionStorage.getItem('isAuthenticated');
                 if (sessionAuth === 'true') setIsAuthenticated(true);
             } catch(e) { console.warn("No session storage access"); }
          }

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
          setIsAuthenticated(false);
        }

        // 4. Initialize School Details (with isolated error handling)
        let details: SchoolDetails | null = null;
        try {
            details = await db.schoolDetails.get(1);
        } catch (detailsError) {
            console.error("Failed to initialize school details. The app will continue.", detailsError);
            details = null; 
        }
        setSchoolDetails(details || null);

      } catch (error) {
        console.error("Critical error during application initialization:", error);
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
  
  const completeSetup = async (initialSession: string, details: SchoolDetails, user: UserProfile) => {
    if (!initialSession.trim() || !details.name) return;
    
    // Hash the password before saving
    const hashedKey = await hashString(user.accessKey);

    await db.transaction('rw', db.sessions, db.schoolDetails, db.user, async () => {
        await db.sessions.add({ name: initialSession.trim() });
        await db.schoolDetails.put({ ...details, id: 1 });
        await db.user.add({ ...user, accessKey: hashedKey });
    });
    
    setActiveSession(initialSession.trim());
    setSchoolDetails(details);
    setIsSetupComplete(true);
    setIsAuthenticated(true);
    try { sessionStorage.setItem('isAuthenticated', 'true'); } catch(e) {}
  };

  const login = async (username: string, key: string): Promise<boolean> => {
      const user = await db.user.where('username').equals(username).first();
      if (!user) return false;

      // 1. Check Hashed Password (New Standard)
      const hashedInput = await hashString(key);
      if (user.accessKey === hashedInput) {
          setIsAuthenticated(true);
          try { sessionStorage.setItem('isAuthenticated', 'true'); } catch(e) {}
          return true;
      }

      // 2. Check Plain Text (Legacy Migration)
      // If the stored key matches the input exactly (and wasn't the hash), it's an old record.
      if (user.accessKey === key) {
          // Migrate to hash immediately
          await db.user.update(user.id!, { accessKey: hashedInput });
          console.log("Security Upgrade: User credentials migrated to hash.");
          
          setIsAuthenticated(true);
          try { sessionStorage.setItem('isAuthenticated', 'true'); } catch(e) {}
          return true;
      }

      return false;
  };

  const logout = () => {
      setIsAuthenticated(false);
      try { sessionStorage.removeItem('isAuthenticated'); } catch(e) {}
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
    isLoading,
    isAuthenticated,
    login,
    logout
  }), [theme, schoolDetails, activeSession, availableSessions, isSetupComplete, isLoading, isAuthenticated]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
