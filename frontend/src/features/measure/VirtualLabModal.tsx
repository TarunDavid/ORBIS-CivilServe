import { useState, useEffect } from 'react';
import { X, Play, Loader2, CheckCircle2 } from 'lucide-react';
import { RoleRequirement } from './competencyApi';
import { fetchLabsForCompetency, createLabSession, submitLabSession, CompetencyLab, LabSession } from './labsApi';

interface Props {
  requirement: RoleRequirement;
  onClose: () => void;
  onComplete: () => void;
}

export default function VirtualLabModal({ requirement, onClose, onComplete }: Props) {
  const [labs, setLabs] = useState<CompetencyLab[]>([]);
  const [activeLab, setActiveLab] = useState<CompetencyLab | null>(null);
  const [session, setSession] = useState<LabSession | null>(null);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
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
  }, [requirement.competency.id]);

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

  const handleSubmit = async () => {
    if (!session) return;
    try {
      setEvaluating(true);
      const updatedSession = await submitLabSession(session.id, userInput);
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
        <div className="bg-white rounded-lg p-8 flex flex-col items-center">
          <Loader2 className="animate-spin text-cobalt mb-4" size={48} />
          <h3 className="font-syne font-bold text-xl">Loading Lab Environment...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-structural/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-jakarta">
      <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in border-4 border-cobalt">
        {/* Header */}
        <div className="bg-structural text-white p-4 flex justify-between items-center border-b border-white/10">
          <div>
            <span className="bg-cobalt/40 text-cobalt-light text-xs font-mono px-2 py-1 rounded mb-2 inline-block">
              VIRTUAL LAB
            </span>
            <h2 className="font-syne text-2xl font-bold flex items-center gap-2">
              {activeLab?.title || `Lab: ${requirement.competency.name}`}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-rust text-white p-4 font-bold text-center">
            {error}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-canvas">
          
          {/* Briefing Panel */}
          <div className="w-full md:w-1/3 bg-white border-r-2 border-dashed border-structural/10 p-6 overflow-y-auto">
            <h3 className="font-grotesk font-bold text-structural text-lg mb-4 border-b-2 border-cobalt pb-2">Scenario Briefing</h3>
            {activeLab ? (
              <div className="prose prose-sm prose-slate font-jakarta">
                <p className="whitespace-pre-wrap">{activeLab.description}</p>
              </div>
            ) : (
              <div className="text-on-surface-variant italic">
                No active labs configured for {requirement.competency.name}. <br/><br/>
                Please ask the admin to create a CompetencyLab for this competency!
              </div>
            )}
            
            {session?.status === 'completed' && (
              <div className="mt-8 bg-mint/10 border-2 border-mint-dark p-4 rounded-lg">
                <h4 className="font-bold text-mint-dark flex items-center gap-2 mb-2">
                  <CheckCircle2 size={18} /> Evaluation Complete
                </h4>
                <div className="text-3xl font-syne font-bold text-structural mb-2">
                  Score: {session.llm_score_raw}/100
                </div>
                <p className="text-sm font-jakarta text-structural/80 whitespace-pre-wrap">
                  {session.llm_feedback}
                </p>
              </div>
            )}
          </div>

          {/* Workspace Panel */}
          <div className="w-full md:w-2/3 flex flex-col bg-slate-900">
            {!session && activeLab && (
              <div className="flex-1 flex items-center justify-center">
                <button 
                  onClick={handleStartLab}
                  className="clay-btn bg-cobalt text-white px-8 py-4 text-lg flex items-center gap-3 hover:-translate-y-1 transition-all"
                >
                  <Play size={24} />
                  Initialize Lab Environment
                </button>
              </div>
            )}

            {session && (
              <>
                <div className="bg-slate-800 text-slate-400 text-sm px-4 py-2 font-mono flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-mint-dark animate-pulse"></div>
                  {activeLab?.environment_type === 'python_notebook' ? 'Python Kernel Ready' : 'Terminal Active'}
                </div>
                <textarea
                  className="flex-1 w-full bg-slate-900 text-slate-100 font-mono p-6 resize-none focus:outline-none focus:ring-inset focus:ring-2 focus:ring-cobalt"
                  placeholder={activeLab?.environment_type === 'python_notebook' ? "# Write your python code here...\nimport pandas as pd" : "-- Write your solution here..."}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={session.status === 'completed' || evaluating}
                />
                <div className="bg-slate-800 p-4 flex justify-end">
                  {session.status !== 'completed' && (
                    <button 
                      onClick={handleSubmit}
                      disabled={evaluating || !userInput.trim()}
                      className="clay-btn bg-mint-dark text-white px-6 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {evaluating ? (
                        <><Loader2 className="animate-spin" size={18} /> Evaluating...</>
                      ) : (
                        <><Play size={18} /> Submit for LLM Evaluation</>
                      )}
                    </button>
                  )}
                  {session.status === 'completed' && (
                    <button 
                      onClick={onClose}
                      className="clay-btn bg-surface text-structural px-6 py-2 border-2 border-structural"
                    >
                      Return to Dashboard
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
