import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { LogOut, BarChart3, UserCircle, Briefcase } from 'lucide-react';

export default function OfficialDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-canvas p-6 md:p-12 text-structural font-jakarta">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
          <div>
            <h1 className="font-syne text-4xl font-[800] text-structural tracking-tight">Competency Dashboard</h1>
            <p className="text-on-surface-variant mt-2 text-lg font-jakarta">
              Welcome back, {user?.id || 'Official'} 
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="clay-btn bg-surface text-structural px-4 py-2 text-sm flex items-center gap-2 border-2 border-structural"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="clay-card bg-white p-6 border-t-[6px] border-t-cobalt">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-cobalt/10 flex items-center justify-center text-cobalt">
                <Briefcase size={20} />
              </div>
              <h3 className="font-grotesk font-bold text-structural">My Department</h3>
            </div>
            <p className="font-jakarta text-lg">{user?.department || 'Ministry of Statistics'}</p>
          </div>

          <div className="clay-card bg-white p-6 border-t-[6px] border-t-mint-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-mint/20 flex items-center justify-center text-mint-dark">
                <UserCircle size={20} />
              </div>
              <h3 className="font-grotesk font-bold text-structural">My Role</h3>
            </div>
            <p className="font-jakarta text-lg capitalize">{user?.role || 'Official'}</p>
          </div>

          <div className="clay-card bg-white p-6 border-t-[6px] border-t-gold">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold-dark">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-grotesk font-bold text-structural">Competency Gap</h3>
            </div>
            <p className="font-jakarta text-lg">Analysis Pending</p>
          </div>
        </div>

        <div className="clay-card bg-surface p-8 text-center border-2 border-dashed border-structural/20">
          <h2 className="font-syne text-2xl font-bold text-structural mb-4">Competency Framework</h2>
          <p className="text-on-surface-variant max-w-lg mx-auto">
            (Phase 2 Implementation) This area will display your official profile, competency cards, knowledge assessments, and experiential labs.
          </p>
        </div>
      </div>
    </div>
  );
}
