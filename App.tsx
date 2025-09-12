import React, { useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Staff from './pages/Staff';
import Exams from './pages/Exams';
import Settings from './pages/Settings';
import BottomNav from './components/BottomNav';
import Reports from './pages/Reports';
import Certificates from './pages/Certificates';
import Timetable from './pages/Timetable';
import ExamMarks from './pages/ExamMarks';

const App: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  const { theme, schoolDetails } = context;

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      root.classList.remove('dark');
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }
  }, [theme]);

  const backgroundStyle = "text-foreground transition-colors duration-300";

  return (
    <HashRouter>
      {schoolDetails?.logo && (
        <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
          <img 
            src={schoolDetails.logo} 
            alt="School Watermark" 
            className="w-2/3 md:w-1/2 lg:w-1/3 h-auto object-contain opacity-5 dark:opacity-[0.03]"
          />
        </div>
      )}
      <div className={`relative z-10 min-h-screen ${backgroundStyle}`}>
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col md:ml-64">
            <Header />
            <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-6">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/staff" element={<Staff />} />
                    <Route path="/exams" element={<Exams />} />
                    <Route path="/exams/:examId" element={<ExamMarks />} />
                    <Route path="/timetable" element={<Timetable />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/certificates" element={<Certificates />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </main>
          </div>
        </div>
        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;