
import React, { useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './contexts/AppContext';
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
import StudentProfile from './pages/StudentProfile';
import StaffProfile from './pages/StaffProfile';
import PrintRollStatement from './pages/PrintRollStatement';

const App: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  }
  
  const { theme, schoolDetails } = context;

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
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
            className="w-2/3 h-auto object-contain opacity-[0.02]"
          />
        </div>
      )}
      <div className={`relative z-10 h-screen flex flex-col ${backgroundStyle}`}>
        <Header />
        <main className="flex-1 p-3 pb-24 overflow-y-auto">
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/student/:id" element={<StudentProfile />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/staff/:id" element={<StaffProfile />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/exams/:examId" element={<ExamMarks />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/print/roll-statement/:className" element={<PrintRollStatement />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </main>
        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;