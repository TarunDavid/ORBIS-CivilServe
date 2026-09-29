import { useState } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Users, 
  Scale, 
  FileText, 
  ArrowRight, 
  CheckCircle, 
  Send,
  Loader2,
  Sparkles
} from 'lucide-react';
import type { LabSession, CompetencyLab } from './labsApi';

interface Props {
  lab: CompetencyLab;
  session: LabSession;
  onSubmit: (userInput: string, sessionState: any) => Promise<void>;
  evaluating: boolean;
}

interface Choice {
  stage_id: number;
  option_id: string;
}

export default function CrisisSimulationView({ lab, session, onSubmit, evaluating }: Props) {
  const scenarioData = lab.scenario_data || {};
  const stages = scenarioData.stages || [];
  const initialMetrics = scenarioData.initial_metrics || {
    integrity: 80,
    trust: 75,
    timeliness: 90,
    coordination: 70
  };

  const existingState = session.session_state || {};
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(
    existingState.current_stage_idx || 0
  );
  const [choices, setChoices] = useState<Choice[]>(existingState.choices || []);
  const [metrics, setMetrics] = useState(existingState.metrics || initialMetrics);
  const [selectedOption, setSelectedOption] = useState<any | null>(null);
  const [executiveRationale, setExecutiveRationale] = useState<string>(
    session.user_input || ''
  );

  const currentStage = stages[currentStageIdx] || null;
  const isAllStagesDecided = choices.length >= stages.length;

  const handleSelectOption = (opt: any) => {
    setSelectedOption(opt);
  };

  const handleConfirmStageDecision = () => {
    if (!selectedOption || !currentStage) return;

    // 1. Calculate new metrics
    const impact = selectedOption.impact || {};
    const newMetrics = {
      integrity: Math.min(100, Math.max(0, metrics.integrity + (impact.integrity || 0))),
      trust: Math.min(100, Math.max(0, metrics.trust + (impact.trust || 0))),
      timeliness: Math.min(100, Math.max(0, metrics.timeliness + (impact.timeliness || 0))),
      coordination: Math.min(100, Math.max(0, metrics.coordination + (impact.coordination || 0))),
    };
    setMetrics(newMetrics);

    // 2. Record choice
    const newChoice: Choice = {
      stage_id: currentStage.stage_id,
      option_id: selectedOption.id
    };
    const updatedChoices = [...choices.filter(c => c.stage_id !== currentStage.stage_id), newChoice];
    setChoices(updatedChoices);

    // 3. Advance stage if available
    setSelectedOption(null);
    if (currentStageIdx + 1 < stages.length) {
      setCurrentStageIdx(currentStageIdx + 1);
    }
  };

  const handleSubmitAll = async () => {
    const finalSessionState = {
      choices,
      metrics,
      current_stage_idx: currentStageIdx,
      status: 'submitted_crisis'
    };
    await onSubmit(executiveRationale, finalSessionState);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100 font-jakarta">
      {/* Top Telemetry War-Room HUD */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rust opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rust"></span>
            </span>
            <div>
              <span className="text-xs font-mono tracking-widest text-rust font-bold uppercase">
                EMBARGO SITUATION PROTOCOL ACTIVE
              </span>
              <h3 className="font-syne font-bold text-lg text-white">
                {scenarioData.simulation_title || lab.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
            <Clock size={15} className="text-amber-400" />
            <span>T-MINUS 01:45:00 TO EMBARGO RELEASE</span>
          </div>
        </div>

        {/* 4 Metric Balance HUD */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldAlert size={14} className="text-cobalt-light" /> Statistical Integrity
              </span>
              <span className="font-mono font-bold text-white">{metrics.integrity}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-cobalt h-full transition-all duration-500 rounded-full"
                style={{ width: `${metrics.integrity}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-bold">
                <Users size={14} className="text-mint" /> Public Trust
              </span>
              <span className="font-mono font-bold text-white">{metrics.trust}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-mint-dark h-full transition-all duration-500 rounded-full"
                style={{ width: `${metrics.trust}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-bold">
                <Clock size={14} className="text-amber-400" /> Timeliness & Markets
              </span>
              <span className="font-mono font-bold text-white">{metrics.timeliness}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${metrics.timeliness}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-bold">
                <Scale size={14} className="text-purple-400" /> Inter-Agency Protocol
              </span>
              <span className="font-mono font-bold text-white">{metrics.coordination}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-purple-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${metrics.coordination}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stage Stepper Tabs */}
      <div className="bg-slate-900/60 px-6 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
        {stages.map((stage: any, idx: number) => {
          const isDecided = choices.some(c => c.stage_id === stage.stage_id);
          const isCurrent = idx === currentStageIdx;
          return (
            <button
              key={stage.stage_id}
              onClick={() => setCurrentStageIdx(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                isCurrent 
                  ? 'bg-cobalt text-white shadow-lg shadow-cobalt/20' 
                  : isDecided 
                    ? 'bg-mint/10 text-mint border border-mint/30' 
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {isDecided ? <CheckCircle size={14} /> : <span>{stage.stage_id}.</span>}
              <span>Stage {stage.stage_id}</span>
            </button>
          );
        })}

        <button
          onClick={() => setCurrentStageIdx(stages.length)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            currentStageIdx === stages.length
              ? 'bg-mint-dark text-white'
              : isAllStagesDecided
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse'
                : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
          }`}
          disabled={!isAllStagesDecided}
        >
          <FileText size={14} />
          <span>Executive Briefing & Submit</span>
        </button>
      </div>

      {/* Main Crisis Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {currentStageIdx < stages.length && currentStage && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Stage Incident Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold uppercase text-cobalt-light tracking-wider">
                  Situation Briefing — Stage {currentStage.stage_id} of {stages.length}
                </span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono">
                  DECISION REQUIRED
                </span>
              </div>
              <h2 className="text-xl font-syne font-bold text-white mb-3">
                {currentStage.title}
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm">
                {currentStage.briefing}
              </p>
            </div>

            {/* Stakeholder Telegrams / Memos */}
            {currentStage.memos && currentStage.memos.length > 0 && (
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <FileText size={15} className="text-amber-400" /> Incoming Inter-Departmental Dispatches
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentStage.memos.map((memo: any, mIdx: number) => (
                    <div 
                      key={mIdx}
                      className="bg-slate-900/90 border-l-4 border-l-amber-400 border border-slate-800 rounded-r-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-amber-300">
                          {memo.from}
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded">
                          {memo.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 italic font-jakarta leading-relaxed">
                        "{memo.message}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decision Choices */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Scale size={15} className="text-cobalt-light" /> Choose Your Directive:
              </h4>

              <div className="space-y-3">
                {currentStage.options.map((option: any) => {
                  const existingChoice = choices.find(c => c.stage_id === currentStage.stage_id);
                  const isChosen = existingChoice?.option_id === option.id;
                  const isSelected = selectedOption?.id === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleSelectOption(option)}
                      className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                        isChosen
                          ? 'bg-mint/10 border-mint-dark text-white'
                          : isSelected
                            ? 'bg-cobalt/20 border-cobalt text-white shadow-lg shadow-cobalt/10'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isChosen 
                              ? 'bg-mint-dark text-white'
                              : isSelected
                                ? 'bg-cobalt text-white'
                                : 'bg-slate-800 text-slate-400'
                          }`}>
                            {option.id}
                          </span>
                          <div>
                            <h5 className="font-bold text-sm text-white mb-1">
                              {option.label}
                            </h5>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {option.description}
                            </p>
                          </div>
                        </div>

                        {isChosen && (
                          <span className="text-xs font-mono bg-mint-dark text-white px-2 py-0.5 rounded shrink-0">
                            CONFIRMED
                          </span>
                        )}
                      </div>

                      {/* Immediate Consequence & Projected Impact Preview */}
                      {(isSelected || isChosen) && (
                        <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-950/70 p-3 rounded-lg">
                          <div className="text-xs text-amber-300 font-mono font-bold mb-1 flex items-center gap-1.5">
                            <Sparkles size={13} /> Immediate Operational Outcome:
                          </div>
                          <p className="text-xs text-slate-300 italic mb-2">
                            {option.consequence}
                          </p>
                          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                            {option.impact?.integrity !== undefined && (
                              <span className={option.impact.integrity >= 0 ? 'text-mint' : 'text-rust'}>
                                Integrity: {option.impact.integrity >= 0 ? `+${option.impact.integrity}` : option.impact.integrity}%
                              </span>
                            )}
                            {option.impact?.trust !== undefined && (
                              <span className={option.impact.trust >= 0 ? 'text-mint' : 'text-rust'}>
                                Trust: {option.impact.trust >= 0 ? `+${option.impact.trust}` : option.impact.trust}%
                              </span>
                            )}
                            {option.impact?.timeliness !== undefined && (
                              <span className={option.impact.timeliness >= 0 ? 'text-mint' : 'text-rust'}>
                                Timeliness: {option.impact.timeliness >= 0 ? `+${option.impact.timeliness}` : option.impact.timeliness}%
                              </span>
                            )}
                            {option.impact?.coordination !== undefined && (
                              <span className={option.impact.coordination >= 0 ? 'text-mint' : 'text-rust'}>
                                Protocol: {option.impact.coordination >= 0 ? `+${option.impact.coordination}` : option.impact.coordination}%
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Confirm Stage Action Button */}
              {selectedOption && (
                <div className="flex justify-end pt-3">
                  <button
                    onClick={handleConfirmStageDecision}
                    className="clay-btn bg-cobalt text-white px-6 py-2.5 flex items-center gap-2 hover:-translate-y-0.5 transition-all text-sm font-bold shadow-lg"
                  >
                    <span>Confirm Stage {currentStage.stage_id} Directive</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final Executive Briefing Step */}
        {currentStageIdx >= stages.length && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <span className="text-xs font-mono font-bold uppercase text-mint tracking-wider block mb-1">
                Phase Completed: All 3 Crisis Stages Formulated
              </span>
              <h2 className="text-2xl font-syne font-bold text-white mb-2">
                Executive Memorandum for the Chief Statistician
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Please provide your institutional rationale summarizing the strategic choices made, the trade-offs accepted between speed and statistical precision, and your recommendations for permanent governance safeguards.
              </p>

              {/* Review of choices */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-6 space-y-2">
                <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">
                  Recorded Directives:
                </h4>
                {choices.map((c, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center gap-2">
                    <CheckCircle size={14} className="text-mint shrink-0" />
                    <span>Stage {c.stage_id}: Option {c.option_id} chosen</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Official Decision Memo & Rationale:
                </label>
                <textarea
                  className="w-full bg-slate-950 text-slate-100 font-mono text-sm p-4 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cobalt h-40 resize-none leading-relaxed"
                  placeholder="Enter your executive justification (e.g. Rationale for freezing embargo vs partial release, tablet verification protocol, and preventative cryptographic sign-off framework)..."
                  value={executiveRationale}
                  onChange={(e) => setExecutiveRationale(e.target.value)}
                  disabled={evaluating}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setCurrentStageIdx(0)}
                  className="clay-btn bg-slate-800 text-slate-300 px-5 py-2.5 text-sm"
                  disabled={evaluating}
                >
                  Review Stages
                </button>
                <button
                  onClick={handleSubmitAll}
                  disabled={evaluating || !executiveRationale.trim()}
                  className="clay-btn bg-mint-dark text-white px-8 py-2.5 flex items-center gap-2 hover:-translate-y-0.5 transition-all text-sm font-bold shadow-lg disabled:opacity-50"
                >
                  {evaluating ? (
                    <><Loader2 className="animate-spin" size={18} /> Submitting Crisis Directives...</>
                  ) : (
                    <><Send size={18} /> Submit Official Crisis Resolution</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
