import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { fetchMyCompetencyRequirements, type RoleRequirement } from './competencyApi';
import { LogOut, BarChart3, UserCircle, Briefcase, AlertCircle, TrendingUp, Play } from 'lucide-react';
import VirtualLabModal from './VirtualLabModal';

export default function OfficialDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<RoleRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLabReq, setActiveLabReq] = useState<RoleRequirement | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const data = await fetchMyCompetencyRequirements();
      setRequirements(data);
    } catch (err) {
      console.error("Failed to fetch competency requirements", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleSimulateLab = (req: RoleRequirement) => {
    setActiveLabReq(req);
  };

  const criticalGaps = requirements.filter(r => (r.target_proficiency - r.current_proficiency) > 2);
  const totalGaps = requirements.filter(r => r.target_proficiency > r.current_proficiency).length;

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
            <p className="font-jakarta text-lg">
              {loading ? 'Analyzing...' : totalGaps === 0 ? 'No Gaps Found' : `${totalGaps} Areas for Improvement`}
            </p>
          </div>
        </div>

        {/* Competency Radar/Bars */}
        <div className="clay-card bg-white p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-syne text-2xl font-bold text-structural flex items-center gap-3">
              <TrendingUp className="text-cobalt" />
              Required Role Competencies
            </h2>
            {criticalGaps.length > 0 && (
              <span className="flex items-center gap-2 text-sm bg-rust/10 text-rust px-3 py-1 rounded-full font-bold">
                <AlertCircle size={16} />
                {criticalGaps.length} Critical Gaps
              </span>
            )}
          </div>

          {loading && requirements.length === 0 ? (
            <div className="animate-pulse space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-surface rounded w-full"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {requirements.map((req) => {
                const targetPct = (req.target_proficiency / 5) * 100;
                const currentPct = (req.current_proficiency / 5) * 100;
                const isCritical = (req.target_proficiency - req.current_proficiency) > 2;

                return (
                  <div key={req.id} className="relative group">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h4 className="font-bold text-structural text-lg flex items-center gap-2">
                          {req.competency.name}
                          {isCritical && <AlertCircle size={14} className="text-rust" />}
                        </h4>
                        <span className="text-sm font-mono text-on-surface-variant bg-surface px-2 py-0.5 rounded">
                          {req.competency.code} • {req.competency.category.name}
                        </span>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <button
                          onClick={() => handleSimulateLab(req)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-cobalt text-white px-2 py-1 rounded flex items-center gap-1"
                        >
                          <Play size={12} />
                          Simulate Lab
                        </button>
                        <div>
                          <span className="text-sm text-on-surface-variant mr-3">Current: <span className="font-bold text-structural">L{req.current_proficiency}</span></span>
                          <span className="text-sm text-cobalt font-bold">Target: L{req.target_proficiency}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* The Track */}
                    <div className="h-4 w-full bg-surface rounded-full overflow-hidden relative border border-structural/10">
                      {/* Target Marker */}
                      <div 
                        className="absolute top-0 bottom-0 border-r-2 border-dashed border-cobalt z-10"
                        style={{ width: `${targetPct}%` }}
                      ></div>
                      
                      {/* Current Proficiency Fill */}
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-rust' : 'bg-mint-dark'}`}
                        style={{ width: `${currentPct}%` }}
                      ></div>

                      {/* Gap Indicator (if any) */}
                      {req.target_proficiency > req.current_proficiency && (
                        <div 
                          className="absolute top-0 bottom-0 bg-gold/30"
                          style={{ 
                            left: `${currentPct}%`, 
                            width: `${targetPct - currentPct}%` 
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
      
      {activeLabReq && (
        <VirtualLabModal 
          requirement={activeLabReq} 
          onClose={() => setActiveLabReq(null)}
          onComplete={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
