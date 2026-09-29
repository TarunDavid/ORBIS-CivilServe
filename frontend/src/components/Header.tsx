import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ChevronRight } from 'lucide-react';

const AVATAR_COLORS = ['bg-cobalt', 'bg-gold', 'bg-mint', 'bg-coral', 'bg-lilac'];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [imgError, setImgError] = useState(false);

  const studentName = localStorage.getItem('student_name') || 'Student';
  const studentGrade = localStorage.getItem('student_grade') || '';
  const studentId = localStorage.getItem('student_id');
  const profilePicture = localStorage.getItem('student_profile_picture');

  // Determine avatar colour from student id for consistency
  const avatarColorIndex = studentId ? parseInt(studentId) % AVATAR_COLORS.length : 0;
  const avatarColor = AVATAR_COLORS[avatarColorIndex];

  // Build profile picture URL
  const getProfilePicUrl = (): string | null => {
    if (!profilePicture) {
      // Try to get from currentStudent in localStorage
      try {
        const s = JSON.parse(localStorage.getItem('currentStudent') || '{}');
        if (s.profile_picture) {
          const url = s.profile_picture.startsWith('http')
            ? s.profile_picture
            : `http://${window.location.hostname || 'localhost'}:8000${s.profile_picture}`;
          return url;
        }
      } catch { /* ignore */ }
      return null;
    }
    if (profilePicture.startsWith('http')) return profilePicture;
    return `http://${window.location.hostname || 'localhost'}:8000${profilePicture}`;
  };

  const profilePicUrl = getProfilePicUrl();

  // Build breadcrumb segments from the current path
  const getBreadcrumbs = (): { label: string; path?: string }[] => {
    const crumbs: { label: string; path?: string }[] = [];
    const path = location.pathname;

    if (path === '/dashboard') {
      crumbs.push({ label: 'Dashboard' });
    } else if (path === '/profile') {
      crumbs.push({ label: 'Dashboard', path: '/dashboard' });
      crumbs.push({ label: 'Profile' });
    } else if (path === '/progress') {
      crumbs.push({ label: 'Dashboard', path: '/dashboard' });
      crumbs.push({ label: 'My Progress' });
    } else if (path.startsWith('/subjects/') && path.endsWith('/chapters')) {
      crumbs.push({ label: 'Dashboard', path: '/dashboard' });
      crumbs.push({ label: 'Chapters' });
    } else if (path.startsWith('/chapters/')) {
      crumbs.push({ label: 'Dashboard', path: '/dashboard' });
      if (path.includes('/flashcards')) {
        crumbs.push({ label: 'Flashcards' });
      } else if (path.includes('/quiz')) {
        crumbs.push({ label: 'Quiz' });
      } else {
        crumbs.push({ label: 'Chapter' });
      }
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="header-bar">
      <div className="header-inner">
        {/* Left: Logo + Breadcrumbs */}
        <div className="header-left">
          <button
            onClick={() => navigate('/dashboard')}
            className="header-logo-btn"
            aria-label="Go to Dashboard"
          >
            <span className="header-logo-text">ORBIS</span>
            <span className="neon-dot header-online-dot" title="Offline-ready"></span>
          </button>

          {breadcrumbs.length > 0 && (
            <nav className="header-breadcrumbs" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="header-crumb-item">
                  <ChevronRight size={14} className="header-crumb-sep" />
                  {crumb.path ? (
                    <button
                      onClick={() => navigate(crumb.path!)}
                      className="header-crumb-link"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="header-crumb-current">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>

        {/* Right: Actions + Avatar */}
        <div className="header-right flex items-center gap-2">
          {/* Main Navigation */}
          <nav className="hidden lg:flex items-center gap-1 mr-4">
            <button onClick={() => navigate('/dashboard-learner')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">Analytics</button>
            <button onClick={() => navigate('/catalog')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">Catalog</button>
            <button onClick={() => navigate('/pathways')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">Pathways</button>
            <button onClick={() => navigate('/assistant')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">AI Assistant</button>
            <button onClick={() => navigate('/virtual-lab')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">Virtual Lab</button>
            <button onClick={() => navigate('/content-studio')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">Studio</button>
            <button onClick={() => navigate('/edge')} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">Edge Sync</button>
          </nav>

          <button
            onClick={() => navigate('/progress')}
            className="header-sync-btn clay-btn bg-cobalt text-white hidden md:flex"
            title="Legacy Progress"
          >
            <span className="header-sync-label font-bold tracking-wide">Legacy Mode</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="header-avatar-btn"
            title={`${studentName} — ${studentGrade}\nView Profile`}
          >
            <div className={`header-avatar ${profilePicUrl && !imgError ? '' : avatarColor}`}>
              {profilePicUrl && !imgError ? (
                <img
                  src={profilePicUrl}
                  alt={studentName}
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setImgError(true)}
                />
              ) : (
                <User size={16} className="text-white" />
              )}
            </div>
            <div className="header-user-info">
              <span className="header-user-name">{studentName}</span>
              <span className="header-user-grade">{studentGrade}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
