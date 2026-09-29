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

/** Pages where the global header should NOT appear */
const NO_HEADER_PATHS = ['/', '/register', '/teacher'];

/** Teacher portal paths (use TeacherHeader, not student Header) */
// const TEACHER_PATHS = ['/teacher/'];

import { Suspense, lazy } from 'react';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded ORBIS feature modules
const CatalogIndex = lazy(() => import('./features/catalog/pages/Index'));
const PathwaysIndex = lazy(() => import('./features/pathways/pages/Index'));
const ContentStudioIndex = lazy(() => import('./features/content-studio/pages/Index'));
const AssistantIndex = lazy(() => import('./features/assistant/pages/Index'));
const DashboardLearnerIndex = lazy(() => import('./features/analytics/pages/Dashboard'));
const DashboardAdminIndex = lazy(() => import('./features/dashboard-admin/pages/Index'));
const VirtualLabIndex = lazy(() => import('./features/virtual-lab/pages/Index'));
const EdgeIndex = lazy(() => import('./features/edge/pages/Index'));

function AppLayout() {
  const location = useLocation();
  const isTeacherPath = location.pathname.startsWith('/teacher');
  const showHeader = !isTeacherPath && !NO_HEADER_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen bg-canvas font-jakarta">
      {showHeader && <Header />}
      <Suspense fallback={<div className="p-8">Loading module...</div>}>
        <Routes>
          {/* ORBIS Feature Modules (New) */}
          <Route path="/catalog/*" element={<ProtectedRoute allowedRoles={['learner', 'trainer', 'admin']}><CatalogIndex /></ProtectedRoute>} />
          <Route path="/pathways/*" element={<ProtectedRoute allowedRoles={['learner', 'trainer', 'admin']}><PathwaysIndex /></ProtectedRoute>} />
          <Route path="/content-studio/*" element={<ProtectedRoute allowedRoles={['trainer', 'admin']}><ContentStudioIndex /></ProtectedRoute>} />
          <Route path="/assistant/*" element={<ProtectedRoute allowedRoles={['learner', 'trainer', 'admin']}><AssistantIndex /></ProtectedRoute>} />
          <Route path="/dashboard-learner/*" element={<ProtectedRoute allowedRoles={['learner', 'trainer', 'admin']}><DashboardLearnerIndex /></ProtectedRoute>} />
          <Route path="/dashboard-admin/*" element={<ProtectedRoute allowedRoles={['admin']}><DashboardAdminIndex /></ProtectedRoute>} />
          <Route path="/virtual-lab/*" element={<ProtectedRoute allowedRoles={['learner', 'trainer', 'admin']}><VirtualLabIndex /></ProtectedRoute>} />
          <Route path="/edge/*" element={<ProtectedRoute allowedRoles={['learner', 'trainer', 'admin']}><EdgeIndex /></ProtectedRoute>} />

          {/* Legacy Student Routes */}
          <Route path="/" element={<SelectProfile />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects/:subjectId/chapters" element={<ChapterList />} />
          <Route path="/chapters/:chapterId" element={<ChapterContent />} />
          <Route path="/chapters/:chapterId/flashcards" element={<FlashcardScreen />} />
          <Route path="/chapters/:chapterId/formulas" element={<FormulaSheetScreen />} />
          <Route path="/chapters/:chapterId/quiz" element={<QuizScreen />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/progress" element={<ProgressDashboard />} />

          {/* Legacy Teacher Portal Routes */}
          <Route path="/teacher" element={<TeacherLogin />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/content/upload" element={<ContentUpload />} />
          <Route path="/teacher/content" element={<ContentList />} />
          <Route path="/teacher/activity" element={<TeacherActivity />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
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
