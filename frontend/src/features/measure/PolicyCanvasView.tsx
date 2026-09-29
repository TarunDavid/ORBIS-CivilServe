import { useState } from 'react';
import { 
  FileText, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Lightbulb
} from 'lucide-react';
import type { LabSession, CompetencyLab } from './labsApi';

interface Props {
  lab: CompetencyLab;
  session: LabSession;
  onSubmit: (userInput: string, sessionState: any) => Promise<void>;
  evaluating: boolean;
}

export default function PolicyCanvasView({ lab, session, onSubmit, evaluating }: Props) {
  const scenarioData = lab.scenario_data || {};
  const sections: string[] = scenarioData.sections || [
    "1. Methodological Justification & Scope",
    "2. Operational Definitions & Protocols",
    "3. Governance & Quality Controls"
  ];
  const keywords: string[] = scenarioData.keywords || [];

  const defaultStarter = sections.map(s => `## ${s}\n\n[Write your analysis here...]\n`).join('\n');
  const [content, setContent] = useState<string>(session.user_input || defaultStarter);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async () => {
    await onSubmit(content, { word_count: wordCount });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100 font-jakarta">
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={16} className="text-cobalt-light" />
          <span className="font-mono text-xs text-slate-300 font-bold">
            Policy Memorandum & Methodological Specification Canvas
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>Words: <strong className="text-white">{wordCount}</strong></span>
          <span className="text-slate-600">|</span>
          <span className={wordCount >= 75 ? 'text-mint' : 'text-amber-400'}>
            {wordCount >= 75 ? 'Optimal Depth' : 'Draft In Progress'}
          </span>
        </div>
      </div>

      {/* Main Layout: Split into Guidance Checklist & Editor */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Policy Guidance Sidebar */}
        <div className="w-full md:w-64 bg-slate-900/70 border-r border-slate-800 p-4 overflow-y-auto space-y-4 text-xs font-mono">
          <div>
            <span className="font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Lightbulb size={14} className="text-amber-400" /> Rubric Blueprint
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Ensure your memorandum addresses each required structural section thoroughly with sound statistical justification.
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Required Sections:
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              {sections.map((sec, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 size={12} className="text-mint shrink-0 mt-0.5" />
                  <span>{sec}</span>
                </li>
              ))}
            </ul>
          </div>

          {keywords.length > 0 && (
            <div>
              <span className="font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Key Concepts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw, i) => (
                  <span 
                    key={i} 
                    className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Markdown/Text Editor */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          <textarea
            className="flex-1 w-full bg-slate-950 text-slate-100 font-mono text-xs md:text-sm p-6 resize-none focus:outline-none focus:ring-1 focus:ring-cobalt leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Draft your policy memorandum..."
            disabled={evaluating}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 px-4 flex items-center justify-between">
        <div className="text-xs text-slate-400 font-mono">
          Auto-saved to session state • Ready for Rubric Evaluation
        </div>

        <button
          onClick={handleSubmit}
          disabled={evaluating || wordCount < 10}
          className="clay-btn bg-mint-dark text-white px-6 py-2 text-xs font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg disabled:opacity-50"
        >
          {evaluating ? (
            <><Loader2 className="animate-spin" size={16} /> Evaluating Policy Memo...</>
          ) : (
            <><Send size={16} /> Submit Policy Memo for Rubric Score</>
          )}
        </button>
      </div>
    </div>
  );
}
