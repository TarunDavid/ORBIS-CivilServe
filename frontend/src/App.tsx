import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Registration from './pages/Registration';
import SelectProfile from './pages/SelectProfile';
import Dashboard from './pages/Dashboard';
import ChapterList from './pages/ChapterList';
import ChapterContent from './pages/ChapterContent';
import FlashcardScreen from './pages/FlashcardScreen';
import QuizScreen from './pages/QuizScreen';
import FormulaSheetScreen from './pages/FormulaSheetScreen';
import Profile from './pages/Profile';
import ProgressDashboard from './pages/ProgressDashboard';
import Header from './components/Header';

// Teacher Portal Pages
import TeacherLogin from './pages/teacher/TeacherLogin';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ContentUpload from './pages/teacher/ContentUpload';
import ContentList from './pages/teacher/ContentList';
import TeacherActivity from './pages/teacher/TeacherActivity';

// ORBIS MEASURE — Auth & Dashboard (Dev A)
import LoginPage from './features/auth/LoginPage';
import OfficialDashboard from './features/measure/OfficialDashboard';
import ProtectedRoute from './features/auth/ProtectedRoute';

/** Pages where the global header should NOT appear */
const NO_HEADER_PATHS = ['/', '/register', '/teacher', '/auth/login'];

/** Teacher portal paths (use TeacherHeader, not student Header) */
const TEACHER_PATHS = ['/teacher/'];

function AppLayout() {
  const location = useLocation();
  const isTeacherPath = location.pathname.startsWith('/teacher');
  const isAuthPath = location.pathname.startsWith('/auth');
  const isMeasurePath = location.pathname.startsWith('/measure');
  const showHeader = !isTeacherPath && !isAuthPath && !isMeasurePath && !NO_HEADER_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen bg-canvas font-jakarta">
      {showHeader && <Header />}
      <Routes>
        {/* Dev A: New Competency Intelligence Entry Point */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        
        {/* Legacy Student Routes (Dev B) */}
        <Route path="/student" element={<SelectProfile />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subjects/:subjectId/chapters" element={<ChapterList />} />
        <Route path="/chapters/:chapterId" element={<ChapterContent />} />
        <Route path="/chapters/:chapterId/flashcards" element={<FlashcardScreen />} />
        <Route path="/chapters/:chapterId/formulas" element={<FormulaSheetScreen />} />
        <Route path="/chapters/:chapterId/quiz" element={<QuizScreen />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/progress" element={<ProgressDashboard />} />

        {/* Teacher Portal Routes */}
        <Route path="/teacher" element={<TeacherLogin />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/content/upload" element={<ContentUpload />} />
        <Route path="/teacher/content" element={<ContentList />} />
        <Route path="/teacher/activity" element={<TeacherActivity />} />

        {/* ORBIS MEASURE — Auth & Dashboard (Dev A) */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route 
          path="/measure/dashboard" 
          element={
            <ProtectedRoute>
              <OfficialDashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
