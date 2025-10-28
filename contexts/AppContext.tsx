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
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'light';
  });

  const [activeSession, _setActiveSession] = useState<string>(() => {
    return localStorage.getItem('activeSession') || '2024-25';
  });
  
  const availableSessionsData = useLiveQuery(() => 
    db.sessions.orderBy('name').reverse().toArray().then(sessions => sessions.map(s => s.name)),
    []
  );
  const availableSessions = availableSessionsData || [];
  
  const setActiveSession = (session: string) => {
    localStorage.setItem('activeSession', session);
    _setActiveSession(session);
  };

  const refreshSessions = async () => {
    const sessions = await db.sessions.orderBy('name').reverse().toArray();
    if (!sessions.map(s => s.name).includes(activeSession)) {
        setActiveSession(sessions[0]?.name || '2024-25');
    }
  };

  useEffect(() => {
    const ensureDefaultSession = async () => {
        const count = await db.sessions.count();
        if(count === 0) {
            await db.sessions.add({ name: '2024-25' });
            _setActiveSession('2024-25');
        } else if (availableSessions.length > 0 && !availableSessions.includes(activeSession)) {
            // If the stored session is invalid, reset to the latest one
            setActiveSession(availableSessions[0]);
        }
    };
    ensureDefaultSession();
  }, [availableSessions, activeSession]);


  const schoolDetailsData = useLiveQuery(() => db.schoolDetails.get(1), []);

  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);

  useEffect(() => {
    if (schoolDetailsData) {
      setSchoolDetails(schoolDetailsData);
    } else {
        db.schoolDetails.count().then(count => {
            if (count === 0) {
                db.schoolDetails.add({
                    id: 1,
                    name: 'My School',
                    address: '123 Education Lane',
                    phone: '555-1234',
                    email: 'contact@myschool.edu',
                    udiseCode: '12345678901',
                    logo: null,
                });
            }
        });
    }
  }, [schoolDetailsData]);

  const refreshSchoolDetails = async () => {
    const details = await db.schoolDetails.get(1);
    setSchoolDetails(details || null);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  return (
    <AppContext.Provider value={{ 
        theme, 
        toggleTheme, 
        schoolDetails, 
        refreshSchoolDetails,
        activeSession,
        setActiveSession,
        availableSessions,
        refreshSessions
    }}>
      {children}
    </AppContext.Provider>
  );
};