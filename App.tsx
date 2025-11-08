
import React, { useContext, useEffect } from 'react';
// FIX: Update react-router-dom imports for v6
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './contexts/AppContext';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Exams from './pages/Exams';
import Settings from './services/Settings';
import BottomNav from './components/BottomNav';
import Reports from './pages/Reports';
import Certificates from './pages/Certificates';
import ExamMarks from './pages/ExamMarks';
import StudentProfile from './pages/StudentProfile';
import PrintRollStatement from './pages/PrintRollStatement';
import PrintHPC from './pages/PrintHPC';
import PrintCategoryRollStatement from './pages/PrintCategoryRollStatement';
import SBA from './pages/SBA';
import SbaDataEntry from './pages/SbaDataEntry';
import FormativeAssessment from './pages/FormativeAssessment';
import StudentReport from './pages/StudentReport';
import PrintCoCurricularReport from './pages/PrintCoCurricularReport';
import PrintFormativeAssessmentReport from './pages/PrintFormativeAssessmentReport';

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

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('Service Worker registered successfully:', registration))
          .catch(error => console.error('Service Worker registration failed:', error));
      };
      
      window.addEventListener('load', registerServiceWorker);
      
      return () => {
        window.removeEventListener('load', registerServiceWorker);
      };
    }
  }, []);

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
        <main className="flex-1 p-3 pb-28 overflow-y-auto">
            {/* FIX: Replaced Switch with Routes and component prop with element prop for react-router-dom v6 */}
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/student/:id" element={<StudentProfile />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/exams/:examId" element={<ExamMarks />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/sba" element={<SBA />} />
                <Route path="/sba-entry" element={<SbaDataEntry />} />
                <Route path="/formative-entry" element={<FormativeAssessment />} />
                <Route path="/student-report" element={<StudentReport />} />
                <Route path="/print/roll-statement/:className" element={<PrintRollStatement />} />
                <Route path="/print/category-roll-statement" element={<PrintCategoryRollStatement />} />
                <Route path="/print/hpc/:studentId" element={<PrintHPC />} />
                <Route path="/print/co-curricular-report/:studentId/:subject" element={<PrintCoCurricularReport />} />
                <Route path="/print/formative-assessment-report/:studentId" element={<PrintFormativeAssessmentReport />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </main>
        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;