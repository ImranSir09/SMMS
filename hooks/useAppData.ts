
import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

export const useAppData = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppProvider');
  }
  return context;
};
