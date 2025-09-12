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
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'light';
  });

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
    <AppContext.Provider value={{ theme, toggleTheme, schoolDetails, refreshSchoolDetails }}>
      {children}
    </AppContext.Provider>
  );
};