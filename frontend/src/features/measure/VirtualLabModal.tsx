import { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Loader2, 
  CheckCircle2, 
  Award, 
  ArrowRight,
  ShieldCheck,
  Compass,
  Cpu
} from 'lucide-react';
import type { RoleRequirement } from './competencyApi';
import { 
  fetchLabsForCompetency, 
  createLabSession, 
  submitLabSession, 
  type CompetencyLab, 
  type LabSession 
} from './labsApi';
import CrisisSimulationView from './CrisisSimulationView';
import DataDetectiveView from './DataDetectiveView';
import CodeLabView from './CodeLabView';
import PolicyCanvasView from './PolicyCanvasView';

interface Props {
  requirement?: RoleRequirement | null;
  initialLab?: CompetencyLab | null;
  onClose: () => void;
  onComplete: () => void;
}

export default function VirtualLabModal({ requirement, initialLab, onClose, onComplete }: Props) {
  const [labs, setLabs] = useState<CompetencyLab[]>([]);
  const [activeLab, setActiveLab] = useState<CompetencyLab | null>(initialLab || null);
  const [session, setSession] = useState<LabSession | null>(null);
  const [loading, setLoading] = useState(!initialLab);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      if (initialLab) {
        setActiveLab(initialLab);
        setLoading(false);
        return;
      }
      if (!requirement?.competency?.id) return;
      try {
        setLoading(true);
        const fetchedLabs = await fetchLabsForCompetency(requirement.competency.id);
        setLabs(fetchedLabs);
        if (fetchedLabs.length > 0) {
          setActiveLab(fetchedLabs[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch labs');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [requirement?.competency?.id, initialLab]);

  const handleStartLab = async () => {
    if (!activeLab) return;
    try {
      setLoading(true);
      const newSession = await createLabSession(activeLab.id);
      setSession(newSession);
    } catch (err: any) {
      setError(err.message || 'Failed to start lab session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (userInput: string, sessionState: any = {}) => {
    if (!session) return;
    try {
      setEvaluating(true);
      const updatedSession = await submitLabSession(session.id, userInput, sessionState);
      setSession(updatedSession);
      onComplete(); // Triggers dashboard refresh in background
    } catch (err: any) {
      setError(err.message || 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading && !session && labs.length === 0) {
    return (
      <div className="fixed inset-0 bg-structural/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center shadow-2xl border-2 border-cobalt">
          <Loader2 className="animate-spin text-cobalt mb-4" size={48} />
          <h3 className="font-syne font-bold text-xl text-structural">Loading Flagship Lab Environment...</h3>
          <p className="text-xs font-mono text-slate-500 mt-1">Calibrating simulation state machine & test fixtures</p>
        </div>
      </div>
    );
  }

  const getEnvBadge = (env?: string) => {
    switch (env) {
      case 'crisis_simulation':
        return { label: 'CRISIS WAR-ROOM SIMULATION', color: 'bg-rust/20 text-rust border-rust/40' };
      case 'data_detective':
        return { label: 'DATA DETECTIVE WORKBENCH', color: 'bg-amber-400/20 text-amber-500 border-amber-400/40' };
      case 'python_notebook':
        return { label: 'PYTHON ANALYSIS KERNEL', color: 'bg-cobalt/20 text-cobalt-light border-cobalt/40' };
      case 'sql_terminal':
        return { label: 'SQL RELATIONAL TERMINAL', color: 'bg-mint/20 text-mint border-mint/40' };
      default:
        return { label: 'POLICY WRITING CANVAS', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
    }
  };

  const envBadge = getEnvBadge(activeLab?.environment_type);

  return (
    <div className="fixed inset-0 bg-structural/85 backdrop-blur-md flex items-center justify-center z-50 p-3 md:p-6 font-jakarta">
      <div className="bg-slate-950 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in border-4 border-cobalt">
        {/* Header */}
        <div className="bg-structural text-white p-4 px-6 flex justify-between items-center border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${envBadge.color}`}>
                {envBadge.label}
              </span>
              {activeLab?.competency && (
                <span className="text-[10px] font-mono text-slate-400">
                  Target Competency: <strong className="text-white">{activeLab.competency.name} ({activeLab.competency.code})</strong>
                </span>
              )}
            </div>
            <h2 className="font-syne text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
              {activeLab?.title || (requirement ? `Lab: ${requirement.competency.name}` : 'Experiential Competency Lab')}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-rust text-white p-3 font-bold text-center text-xs shrink-0">
            {error}
          </div>
        )}

        {/* Body Container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 1. NOT STARTED STATE: Briefing & Launch Screen */}
          {!session && activeLab && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950">
              {/* Left Briefing Card */}
              <div className="w-full md:w-1/2 p-8 overflow-y-auto border-r border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 text-cobalt-light font-mono text-xs font-bold mb-3 uppercase tracking-wider">
                    <Compass size={16} /> Operational Scenario Briefing
                  </div>
                  <h3 className="font-syne text-2xl font-bold text-white mb-4">
                    {activeLab.title}
                  </h3>
                  <div className="prose prose-invert prose-sm text-slate-300 font-jakarta leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                    {activeLab.description}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                  <div className="flex items-center gap-2 text-slate-300">
                    <ShieldCheck size={14} className="text-mint" /> 
                    <span>Evaluation Method: Explainable Rubric Agent</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Cpu size={14} className="text-cobalt-light" />
                    <span>Evidence Pipeline: Generates Official Evidence Record upon completion</span>
                  </div>
                </div>
              </div>

              {/* Right Launch Terminal */}
              <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center bg-slate-900/30 text-center">
                <div className="w-20 h-20 rounded-2xl bg-cobalt/20 border-2 border-cobalt flex items-center justify-center text-cobalt mb-6 shadow-xl shadow-cobalt/10">
                  <Award size={40} />
                </div>
                <h4 className="font-syne text-xl font-bold text-white mb-2">
                  Ready to Demonstrate Competency?
                </h4>
                <p className="text-xs text-slate-400 max-w-md mb-8 leading-relaxed">
                  Your actions, trade-off decisions, and analytical findings in this lab are graded against national statistical benchmarks and permanently recorded in your Digital Skill Passport.
                </p>

                <button 
                  onClick={handleStartLab}
                  className="clay-btn bg-cobalt text-white px-8 py-4 text-base font-bold flex items-center gap-3 hover:-translate-y-1 transition-all shadow-xl shadow-cobalt/30"
                >
                  <Play size={20} />
                  <span>Initialize Lab Environment</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* 2. COMPLETED STATE: Evaluation Scorecard & Evidence Seal */}
          {session?.status === 'completed' && (
            <div className="flex-1 overflow-y-auto p-8 bg-slate-950 flex flex-col items-center justify-center">
              <div className="bg-slate-900 border-2 border-mint-dark rounded-2xl max-w-2xl w-full p-8 shadow-2xl animate-fade-in text-center">
                <div className="w-16 h-16 rounded-full bg-mint/20 border-2 border-mint text-mint flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={36} />
                </div>

                <span className="text-xs font-mono font-bold uppercase tracking-widest text-mint block mb-1">
                  OFFICIAL EVIDENCE RECORDED & SEALED
                </span>
                <h3 className="font-syne font-bold text-2xl text-white mb-1">
                  Competency Lab Evaluation Complete
                </h3>
                <p className="text-xs text-slate-400 font-mono mb-6">
                  Session Ref: {session.id}
                </p>

                {/* Score Dial */}
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 mb-6 inline-block w-full max-w-xs">
                  <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
                    Awarded Rubric Score
                  </span>
                  <div className="text-5xl font-syne font-black text-white">
                    {session.llm_score_raw}
                    <span className="text-xl text-slate-500 font-normal">/100</span>
                  </div>
                </div>

                {/* Qualitative Feedback */}
                <div className="text-left bg-slate-950 p-5 rounded-xl border border-slate-800 mb-6 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {session.llm_feedback}
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={onClose}
                    className="clay-btn bg-mint-dark text-white px-8 py-3 text-sm font-bold shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    Return to Dashboard & Radar Chart
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. ACTIVE SIMULATION STATE: Dispatch to Specialized View */}
          {session && session.status !== 'completed' && activeLab && (
            <>
              {activeLab.environment_type === 'crisis_simulation' && (
                <CrisisSimulationView
                  lab={activeLab}
                  session={session}
                  onSubmit={handleSubmit}
                  evaluating={evaluating}
                />
              )}

              {activeLab.environment_type === 'data_detective' && (
                <DataDetectiveView
                  lab={activeLab}
                  session={session}
                  onSubmit={handleSubmit}
                  evaluating={evaluating}
                />
              )}

              {(activeLab.environment_type === 'python_notebook' || activeLab.environment_type === 'sql_terminal') && (
                <CodeLabView
                  lab={activeLab}
                  session={session}
                  onSubmit={handleSubmit}
                  evaluating={evaluating}
                />
              )}

              {activeLab.environment_type === 'policy_canvas' && (
                <PolicyCanvasView
                  lab={activeLab}
                  session={session}
                  onSubmit={handleSubmit}
                  evaluating={evaluating}
                />
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
