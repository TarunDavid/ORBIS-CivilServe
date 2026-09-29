import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { fetchMyCompetencyRequirements, type RoleRequirement } from './competencyApi';
import { fetchAllLabs, type CompetencyLab } from './labsApi';
import { 
  LogOut, 
  BarChart3, 
  UserCircle, 
  Briefcase, 
  AlertCircle, 
  TrendingUp, 
  Play, 
  FlaskConical,
  Code2,
  Database,
  FileText,
  Award
} from 'lucide-react';
import VirtualLabModal from './VirtualLabModal';
import CompetencyCardModal from './CompetencyCardModal';

export default function OfficialDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<RoleRequirement[]>([]);
  const [allLabs, setAllLabs] = useState<CompetencyLab[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLabReq, setActiveLabReq] = useState<RoleRequirement | null>(null);
  const [selectedLab, setSelectedLab] = useState<CompetencyLab | null>(null);
  const [showCompetencyCard, setShowCompetencyCard] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [reqData, labData] = await Promise.all([
        fetchMyCompetencyRequirements().catch(() => []),
        fetchAllLabs().catch(() => [])
      ]);
      setRequirements(reqData);
      setAllLabs(labData);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
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
    setSelectedLab(null);
  };

  const handleOpenDirectLab = (lab: CompetencyLab) => {
    setSelectedLab(lab);
    setActiveLabReq(null);
  };

  const criticalGaps = requirements.filter(r => (r.target_proficiency - r.current_proficiency) > 2);
  const totalGaps = requirements.filter(r => r.target_proficiency > r.current_proficiency).length;

  return (
    <div className="min-h-screen bg-canvas p-6 md:p-12 text-structural font-jakarta">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cobalt/10 text-cobalt mb-2">
              <span className="w-2 h-2 rounded-full bg-cobalt animate-ping"></span>
              ORBIS MEASURE • COMPETENCY INTELLIGENCE
            </div>
            <h1 className="font-syne text-4xl font-[800] text-structural tracking-tight">Official Dashboard</h1>
            <p className="text-on-surface-variant mt-1 text-base font-jakarta">
              Demonstrated Competency & Experiential Assessment Engine
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCompetencyCard(true)}
              className="clay-btn bg-white hover:bg-gold/10 text-structural px-4 py-2 text-sm font-bold flex items-center gap-2 border-2 border-gold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Award size={16} className="text-gold-dark" />
              Digital Skill Passport
            </button>
            <button 
              onClick={handleLogout}
              className="clay-btn bg-surface text-structural px-4 py-2 text-sm flex items-center gap-2 border-2 border-structural hover:bg-white transition-all cursor-pointer"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </header>

        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="clay-card bg-white p-6 border-t-[6px] border-t-cobalt">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-cobalt/10 flex items-center justify-center text-cobalt">
                <Briefcase size={20} />
              </div>
              <h3 className="font-grotesk font-bold text-structural">My Department</h3>
            </div>
            <p className="font-jakarta text-lg font-bold">{user?.department || 'MOSPI'}</p>
            <p className="text-xs text-on-surface-variant mt-1">Ministry of Statistics & Programme Implementation</p>
          </div>

          <div className="clay-card bg-white p-6 border-t-[6px] border-t-mint-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-mint/20 flex items-center justify-center text-mint-dark">
                <UserCircle size={20} />
              </div>
              <h3 className="font-grotesk font-bold text-structural">My Role</h3>
            </div>
            <p className="font-jakarta text-lg font-bold capitalize">{user?.role || 'Statistical Officer'}</p>
            <p className="text-xs text-on-surface-variant mt-1">Official Statistical Service (India)</p>
          </div>

          <div className="clay-card bg-white p-6 border-t-[6px] border-t-gold">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold-dark">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-grotesk font-bold text-structural">Competency Gap Status</h3>
            </div>
            <p className="font-jakarta text-lg font-bold">
              {loading ? 'Analyzing...' : totalGaps === 0 ? 'No Critical Gaps' : `${totalGaps} Areas with Target Gap`}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">{criticalGaps.length} critical requirement gaps</p>
          </div>
        </div>

        {/* SECTION 1: Experiential Virtual Labs Catalog */}
        <div className="clay-card bg-white p-8 mb-8 border-2 border-cobalt/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-cobalt/10 text-cobalt mb-2">
                <FlaskConical size={14} /> EXPERIENTIAL COMPETENCY LABS
              </div>
              <h2 className="font-syne text-2xl font-bold text-structural">
                Virtual Simulation Labs
              </h2>
              <p className="text-on-surface-variant text-sm mt-0.5">
                Execute realistic statistical assignments and receive real-time LLM evaluation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-surface text-structural px-3 py-1.5 rounded-full border border-structural/10">
                {allLabs.length} Available Labs
              </span>
            </div>
          </div>

          {loading && allLabs.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-44 bg-surface rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allLabs.map((lab) => {
                const isPython = lab.environment_type === 'python_notebook';
                const isSql = lab.environment_type === 'sql_terminal';

                return (
                  <div 
                    key={lab.id} 
                    className="border border-structural/10 rounded-xl p-5 bg-canvas/30 hover:bg-white hover:border-cobalt/30 hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isPython 
                            ? 'bg-blue-100 text-blue-800' 
                            : isSql 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isPython && <Code2 size={12} />}
                          {isSql && <Database size={12} />}
                          {!isPython && !isSql && <FileText size={12} />}
                          {isPython ? 'Python Notebook' : isSql ? 'SQL Terminal' : 'Policy Canvas'}
                        </span>
                        <span className="text-[11px] font-mono text-on-surface-variant bg-surface px-2 py-0.5 rounded border border-structural/10">
                          {lab.competency?.code}
                        </span>
                      </div>

                      <h4 className="font-bold text-structural text-base group-hover:text-cobalt transition-colors line-clamp-2 mb-2">
                        {lab.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant line-clamp-3 mb-4 font-jakarta leading-relaxed">
                        {lab.description.split('\n')[0]}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenDirectLab(lab)}
                      className="w-full text-xs font-bold bg-structural hover:bg-cobalt text-white py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95 cursor-pointer shadow-sm"
                    >
                      <Play size={12} className="fill-white" />
                      Enter Virtual Lab
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: Competency Gap Analysis Trackers */}
        <div className="clay-card bg-white p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-syne text-2xl font-bold text-structural flex items-center gap-3">
                <TrendingUp className="text-cobalt" />
                Required Role Competencies
              </h2>
              <p className="text-on-surface-variant text-sm mt-1">
                Target levels required for your designation vs demonstrated evidence score.
              </p>
            </div>
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
                  <div key={req.id} className="relative group p-4 rounded-xl hover:bg-canvas/30 transition-all border border-transparent hover:border-structural/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <div>
                        <h4 className="font-bold text-structural text-lg flex items-center gap-2">
                          {req.competency.name}
                          {isCritical && <AlertCircle size={14} className="text-rust" />}
                        </h4>
                        <span className="text-xs font-mono text-on-surface-variant bg-surface px-2 py-0.5 rounded border border-structural/10">
                          {req.competency.code} • {req.competency.category?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-on-surface-variant mr-3">
                            Demonstrated: <span className="font-bold text-structural">L{req.current_proficiency}/5</span>
                          </span>
                          <span className="text-cobalt font-bold">
                            Target: L{req.target_proficiency}/5
                          </span>
                        </div>
                        <button
                          onClick={() => handleSimulateLab(req)}
                          className="text-xs bg-cobalt hover:bg-cobalt-dark text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow hover:shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          <Play size={12} className="fill-white" />
                          Launch Lab
                        </button>
                      </div>
                    </div>
                    
                    {/* The Track */}
                    <div className="h-4 w-full bg-surface rounded-full overflow-hidden relative border border-structural/10">
                      {/* Target Marker */}
                      <div 
                        className="absolute top-0 bottom-0 border-r-2 border-dashed border-cobalt z-10"
                        style={{ width: `${targetPct}%` }}
                        title={`Target: Level ${req.target_proficiency}`}
                      ></div>
                      
                      {/* Current Proficiency Fill */}
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-rust' : 'bg-mint-dark'}`}
                        style={{ width: `${currentPct}%` }}
                      ></div>

                      {/* Gap Indicator (if any) */}
                      {req.target_proficiency > req.current_proficiency && (
                        <div 
                          className="absolute top-0 bottom-0 bg-gold/25"
                          style={{ 
                            left: `${currentPct}%`, 
                            width: `${targetPct - currentPct}%` 
                          }}
                          title={`Proficiency Gap: ${req.target_proficiency - req.current_proficiency} levels`}
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
      
      {/* Virtual Lab Modal */}
      {(activeLabReq || selectedLab) && (
        <VirtualLabModal 
          requirement={activeLabReq}
          initialLab={selectedLab}
          onClose={() => {
            setActiveLabReq(null);
            setSelectedLab(null);
          }}
          onComplete={() => {
            loadData();
          }}
        />
      )}

      {/* Official Competency Card & Digital Skill Passport Modal */}
      {showCompetencyCard && (
        <CompetencyCardModal
          onClose={() => setShowCompetencyCard(false)}
        />
      )}
    </div>
  );
}
