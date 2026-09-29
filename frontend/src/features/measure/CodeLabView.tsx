import { useState } from 'react';
import { 
  Play, 
  Terminal, 
  Database, 
  CheckCircle, 
  Loader2, 
  Send
} from 'lucide-react';
import type { LabSession, CompetencyLab } from './labsApi';

interface Props {
  lab: CompetencyLab;
  session: LabSession;
  onSubmit: (userInput: string, sessionState: any) => Promise<void>;
  evaluating: boolean;
}

export default function CodeLabView({ lab, session, onSubmit, evaluating }: Props) {
  const scenarioData = lab.scenario_data || {};
  const isPython = lab.environment_type === 'python_notebook';

  const defaultStarter = isPython 
    ? (scenarioData.starter_code || '# Write your python code using pandas...\nimport pandas as pd\n')
    : (scenarioData.starter_query || '-- Write your ANSI SQL query here...\nSELECT * FROM census_district_data;\n');

  const [code, setCode] = useState<string>(session.user_input || defaultStarter);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [runningSim, setRunningSim] = useState(false);
  const [simOutput, setSimOutput] = useState<string | null>(null);

  const handleRunSim = () => {
    setRunningSim(true);
    setTimeout(() => {
      setRunningSim(false);
      if (isPython) {
        if (code.includes('pd.read_csv') || code.includes('import pandas')) {
          setSimOutput(
            "[KERNEL] Python 3.11 Execution Output:\n" +
            "Loaded survey_raw.csv (5 rows x 4 cols)\n" +
            "Median age calculated: 34.0\n" +
            "Standardized villages: ['RAMPUR', 'SHIVPUR', 'KALYANPUR']\n" +
            "Grouped Summary Counts:\n" +
            "   village     count   mean_age\n" +
            "0  KALYANPUR   1       34.0\n" +
            "1  RAMPUR      2       34.0\n" +
            "2  SHIVPUR      2       37.0\n\n" +
            "Status: Execution completed with exit code 0."
          );
        } else {
          setSimOutput("[KERNEL] Syntax Warning: 'pandas' module not imported or DataFrame not defined.");
        }
      } else {
        if (code.toUpperCase().includes('JOIN')) {
          setSimOutput(
            "[SQL ENGINE] Query Plan Executed in 12ms:\n" +
            "+-------------+---------------+------------+------------+-----------------+\n" +
            "| district_id | district_name | census_pop | health_pop | discrepancy_pct |\n" +
            "+-------------+---------------+------------+------------+-----------------+\n" +
            "| DIST-104    | Pune Rural    | 124,000    | 138,500    | 11.69%          |\n" +
            "| DIST-109    | Surat Urban   | 340,000    | 365,000    | 7.35%           |\n" +
            "| DIST-112    | Howrah North  | 89,000     | 95,200     | 6.97%           |\n" +
            "+-------------+---------------+------------+------------+-----------------+\n" +
            "3 rows returned (filtered where discrepancy > 5%)."
          );
        } else {
          setSimOutput("[SQL ENGINE] Notice: Query executed without JOIN condition. Cross-product table scan not recommended.");
        }
      }
    }, 700);
  };

  const handleSubmit = async () => {
    await onSubmit(code, { executed_sim: !!simOutput });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100 font-jakarta">
      {/* Code Lab Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-mint-dark animate-pulse"></div>
          <span className="font-mono text-xs text-slate-400">
            {isPython ? 'Python 3.11 Runtime (Pandas / NumPy)' : 'ANSI SQL Query Console (PostgreSQL Dialect)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'editor' ? 'bg-cobalt text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Terminal size={13} /> Code Workspace
              </span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'preview' ? 'bg-cobalt text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Database size={13} /> Schema & Sample Data
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor or Schema View */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 border-r border-slate-800">
          {activeTab === 'editor' ? (
            <textarea
              className="flex-1 w-full bg-slate-950 text-slate-100 font-mono text-xs md:text-sm p-4 resize-none focus:outline-none focus:ring-1 focus:ring-cobalt leading-relaxed"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code solution..."
              disabled={evaluating}
              spellCheck={false}
            />
          ) : (
            <div className="flex-1 p-6 overflow-y-auto space-y-4 font-mono text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                <Database size={16} className="text-cobalt-light" />
                {isPython ? 'Sample CSV Structure (survey_raw.csv)' : 'Database Schemas'}
              </h4>

              {isPython && scenarioData.sample_dataset && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <pre className="text-slate-300">
                    {JSON.stringify(scenarioData.sample_dataset, null, 2)}
                  </pre>
                  {scenarioData.expected_output_hint && (
                    <div className="mt-3 p-2 bg-slate-950 rounded border border-slate-800 text-amber-300 text-[11px]">
                      Hint: {scenarioData.expected_output_hint}
                    </div>
                  )}
                </div>
              )}

              {!isPython && scenarioData.tables_schema && (
                <div className="space-y-3">
                  {Object.entries(scenarioData.tables_schema).map(([tbl, cols]: [string, any]) => (
                    <div key={tbl} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <div className="font-bold text-mint-light mb-1.5">{tbl}</div>
                      <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                        {cols.map((c: string, ci: number) => (
                          <li key={ci}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Test Runner Simulator Console */}
          {simOutput && (
            <div className="h-44 bg-slate-900 border-t border-slate-800 p-3 font-mono text-xs overflow-y-auto">
              <div className="flex items-center justify-between text-slate-400 mb-1 border-b border-slate-800 pb-1 text-[11px]">
                <span className="flex items-center gap-1 font-bold text-mint">
                  <CheckCircle size={13} /> Simulation Test Run Result:
                </span>
                <button 
                  onClick={() => setSimOutput(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Clear Output
                </button>
              </div>
              <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {simOutput}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 px-4 flex items-center justify-between">
        <button
          onClick={handleRunSim}
          disabled={runningSim || evaluating}
          className="clay-btn bg-slate-800 text-slate-200 hover:text-white px-4 py-2 text-xs font-mono font-bold flex items-center gap-2 transition-all"
        >
          {runningSim ? (
            <><Loader2 className="animate-spin" size={14} /> Executing Sandbox...</>
          ) : (
            <><Play size={14} className="text-mint" /> Run & Validate Code</>
          )}
        </button>

        <button
          onClick={handleSubmit}
          disabled={evaluating || !code.trim()}
          className="clay-btn bg-mint-dark text-white px-6 py-2 text-xs font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg disabled:opacity-50"
        >
          {evaluating ? (
            <><Loader2 className="animate-spin" size={16} /> Evaluating with LLM Rubric...</>
          ) : (
            <><Send size={16} /> Submit Solution for Rubric Score</>
          )}
        </button>
      </div>
    </div>
  );
}
