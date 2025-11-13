
import React, { useContext, useEffect } from 'react';
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
import PrintCertificatePage from './pages/PrintCertificatePage';
import PrintSbaResultSheet from './pages/PrintSbaResultSheet';

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
            className="w-2/3 h-auto object-contain opacity-[0.04] dark:opacity-[0.06]"
          />
        </div>
      )}
      <div className={`relative z-10 h-screen flex flex-col ${backgroundStyle}`}>
        <Header />
        <main className="flex-1 p-3 pb-24 overflow-y-auto">
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/student/:id" element={<StudentProfile />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/exams/:examId" element={<ExamMarks />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/generate-certificate" element={<Certificates />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/sba" element={<SBA />} />
                <Route path="/sba-entry" element={<SbaDataEntry />} />
                <Route path="/formative-entry" element={<FormativeAssessment />} />
                <Route path="/student-report" element={<StudentReport />} />
                <Route path="/print/roll-statement/:className" element={<PrintRollStatement />} />
                <Route path="/print/category-roll-statement" element={<PrintCategoryRollStatement />} />
                <Route path="/print/hpc/:studentId" element={<PrintHPC />} />
                <Route path="/print/certificate/:type" element={<PrintCertificatePage />} />
                <Route path="/print/co-curricular-report/:studentId/:subject" element={<PrintCoCurricularReport />} />
                <Route path="/print/formative-assessment-report/:studentId" element={<PrintFormativeAssessmentReport />} />
                <Route path="/print/sba-result-sheet/:className/:examId" element={<PrintSbaResultSheet />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <footer className="text-center text-xs text-foreground/50 py-4 mt-4 border-t border-border">
                <p>&copy; {new Date().getFullYear()} School Management Pro V2</p>
                <p className="text-[10px]">by Imran Gani Mugloo Teacher Zone Vailoo</p>
            </footer>
        </main>
        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;
