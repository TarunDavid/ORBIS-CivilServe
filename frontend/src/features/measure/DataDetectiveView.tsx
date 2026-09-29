import { useState } from 'react';
import { 
  AlertTriangle, 
  Check, 
  Search, 
  Filter, 
  ShieldCheck, 
  X, 
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

interface FlaggedAnomaly {
  record_id: string;
  field: string;
  anomaly_type: string;
  action: string;
  note: string;
}

export default function DataDetectiveView({ lab, session, onSubmit, evaluating }: Props) {
  const scenarioData = lab.scenario_data || {};
  const records: any[] = scenarioData.records || [];
  const targetCount: number = scenarioData.target_anomaly_count || 5;

  const existingState = session.session_state || {};
  const [flaggedAnomalies, setFlaggedAnomalies] = useState<FlaggedAnomaly[]>(
    existingState.flagged_anomalies || []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'flagged' | 'clean'>('all');
  const [inspectingRecord, setInspectingRecord] = useState<any | null>(null);

  // Form state inside inspector
  const [defectType, setDefectType] = useState('Physiological Impossibility');
  const [defectField, setDefectField] = useState('respondent_age');
  const [remediationAction, setRemediationAction] = useState('Quarantine Record');
  const [auditorNote, setAuditorNote] = useState('');
  const [overallAuditNotes, setOverallAuditNotes] = useState(session.user_input || '');

  const openInspector = (record: any) => {
    setInspectingRecord(record);
    const existing = flaggedAnomalies.find(f => f.record_id === record.record_id);
    if (existing) {
      setDefectType(existing.anomaly_type);
      setDefectField(existing.field);
      setRemediationAction(existing.action);
      setAuditorNote(existing.note);
    } else {
      setDefectType('Physiological Impossibility');
      setDefectField('respondent_age');
      setRemediationAction('Quarantine Record');
      setAuditorNote('');
    }
  };

  const handleSaveFlag = () => {
    if (!inspectingRecord) return;
    const newFlag: FlaggedAnomaly = {
      record_id: inspectingRecord.record_id,
      field: defectField,
      anomaly_type: defectType,
      action: remediationAction,
      note: auditorNote,
    };
    const updated = [
      ...flaggedAnomalies.filter(f => f.record_id !== inspectingRecord.record_id),
      newFlag,
    ];
    setFlaggedAnomalies(updated);
    setInspectingRecord(null);
  };

  const handleRemoveFlag = () => {
    if (!inspectingRecord) return;
    const updated = flaggedAnomalies.filter(f => f.record_id !== inspectingRecord.record_id);
    setFlaggedAnomalies(updated);
    setInspectingRecord(null);
  };

  const filteredRecords = records.filter(r => {
    const isFlagged = flaggedAnomalies.some(f => f.record_id === r.record_id);
    if (filterMode === 'flagged' && !isFlagged) return false;
    if (filterMode === 'clean' && isFlagged) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.record_id?.toLowerCase().includes(term) ||
      r.state_code?.toLowerCase().includes(term) ||
      r.district_id?.toLowerCase().includes(term) ||
      String(r.respondent_age).includes(term)
    );
  });

  const handleSubmitAudit = async () => {
    const finalSessionState = {
      flagged_anomalies: flaggedAnomalies,
      total_audited: records.length,
      status: 'submitted_detective'
    };
    await onSubmit(overallAuditNotes, finalSessionState);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100 font-jakarta">
      {/* Top Header Control Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-cobalt/30 text-cobalt-light font-mono text-xs px-2 py-0.5 rounded font-bold uppercase">
                MICRODATA QUALITY DETECTIVE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Dataset: {scenarioData.dataset_name || 'Primary Survey Sample'}
              </span>
            </div>
            <h3 className="font-syne font-bold text-lg text-white">
              {lab.title}
            </h3>
          </div>

          {/* Audit Metrics HUD */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 block font-mono">RECORDS</span>
              <span className="font-bold text-white text-sm font-mono">{records.length} Sample</span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 block font-mono">DEFECTS FLAGGED</span>
              <span className="font-bold text-amber-400 text-sm font-mono">
                {flaggedAnomalies.length} / {targetCount} Target
              </span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 block font-mono">AUDIT POSTURE</span>
              <span className={`font-bold text-sm font-mono ${flaggedAnomalies.length >= targetCount ? 'text-mint' : 'text-slate-300'}`}>
                {flaggedAnomalies.length >= targetCount ? 'Target Reached' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search record, district, age..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 text-xs text-slate-100 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cobalt w-56 font-mono"
              />
            </div>

            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filterMode === 'all' ? 'bg-cobalt text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({records.length})
              </button>
              <button
                onClick={() => setFilterMode('flagged')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filterMode === 'flagged' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Flagged ({flaggedAnomalies.length})
              </button>
              <button
                onClick={() => setFilterMode('clean')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filterMode === 'clean' ? 'bg-mint-dark text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Clean ({records.length - flaggedAnomalies.length})
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Filter size={13} /> Click any row to inspect physiological/relational defects
          </div>
        </div>
      </div>

      {/* Main Interactive Table Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Record ID</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">Age</th>
                <th className="py-3 px-3">Monthly Income</th>
                <th className="py-3 px-3">Dependents</th>
                <th className="py-3 px-3">Systolic BP</th>
                <th className="py-3 px-3">Diastolic BP</th>
                <th className="py-3 px-3 text-center">Audit Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredRecords.map((r) => {
                const flagged = flaggedAnomalies.find(f => f.record_id === r.record_id);
                return (
                  <tr 
                    key={r.record_id}
                    onClick={() => openInspector(r)}
                    className={`cursor-pointer transition-colors ${
                      flagged 
                        ? 'bg-amber-500/10 hover:bg-amber-500/20' 
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                      {flagged && <AlertTriangle size={13} className="text-amber-400 shrink-0" />}
                      <span>{r.record_id}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{r.state_code}</td>
                    <td className="py-2.5 px-3 text-slate-300">{r.district_id}</td>
                    <td className={`py-2.5 px-3 font-bold ${r.respondent_age > 120 ? 'text-rust' : 'text-slate-300'}`}>
                      {r.respondent_age}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      ₹{r.monthly_income_inr?.toLocaleString() || '-'}
                    </td>
                    <td className={`py-2.5 px-3 font-bold ${r.dependents_count > 15 ? 'text-rust' : 'text-slate-300'}`}>
                      {r.dependents_count}
                    </td>
                    <td className={`py-2.5 px-3 ${r.systolic_bp < r.diastolic_bp ? 'text-rust font-bold' : 'text-slate-300'}`}>
                      {r.systolic_bp}
                    </td>
                    <td className={`py-2.5 px-3 ${r.systolic_bp < r.diastolic_bp ? 'text-rust font-bold' : 'text-slate-300'}`}>
                      {r.diastolic_bp}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {flagged ? (
                        <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded text-[10px] font-bold">
                          {flagged.anomaly_type}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Unflagged</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openInspector(r);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          flagged 
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {flagged ? 'Edit Flag' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission and Auditor Certification Note */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-2/3">
          <input
            type="text"
            placeholder="Official Audit Summary & Methodology Note (e.g. Range constraints applied, deduplication rationale, and outlier handling strategy)..."
            value={overallAuditNotes}
            onChange={(e) => setOverallAuditNotes(e.target.value)}
            disabled={evaluating}
            className="w-full bg-slate-950 text-slate-100 text-xs font-mono p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cobalt"
          />
        </div>

        <button
          onClick={handleSubmitAudit}
          disabled={evaluating || flaggedAnomalies.length === 0}
          className="clay-btn bg-mint-dark text-white px-6 py-2.5 flex items-center gap-2 hover:-translate-y-0.5 transition-all text-xs font-bold shrink-0 disabled:opacity-50"
        >
          {evaluating ? (
            <><Loader2 className="animate-spin" size={16} /> Evaluating Microdata Audit...</>
          ) : (
            <><Send size={16} /> Submit Audit Certification ({flaggedAnomalies.length} Flagged)</>
          )}
        </button>
      </div>

      {/* Inspector Modal / Slide-over Drawer */}
      {inspectingRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border-2 border-cobalt rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl animate-fade-in font-jakarta">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-cobalt-light font-bold">
                  RECORD INSPECTOR & DEFECT CLASSIFIER
                </span>
                <h4 className="font-syne font-bold text-lg text-white">
                  Record ID: {inspectingRecord.record_id}
                </h4>
              </div>
              <button 
                onClick={() => setInspectingRecord(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Microdata Raw Attributes Summary */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-4 grid grid-cols-3 gap-2 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">State/Dist:</span>
                <span className="font-bold text-slate-200">{inspectingRecord.state_code} / {inspectingRecord.district_id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Age:</span>
                <span className={`font-bold ${inspectingRecord.respondent_age > 120 ? 'text-rust' : 'text-slate-200'}`}>
                  {inspectingRecord.respondent_age} yrs
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Income:</span>
                <span className="font-bold text-slate-200">₹{inspectingRecord.monthly_income_inr}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Dependents:</span>
                <span className={`font-bold ${inspectingRecord.dependents_count > 15 ? 'text-rust' : 'text-slate-200'}`}>
                  {inspectingRecord.dependents_count}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Blood Pressure:</span>
                <span className={`font-bold ${inspectingRecord.systolic_bp < inspectingRecord.diastolic_bp ? 'text-rust' : 'text-slate-200'}`}>
                  {inspectingRecord.systolic_bp}/{inspectingRecord.diastolic_bp}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Status:</span>
                <span className="font-bold text-slate-200">{inspectingRecord.survey_status}</span>
              </div>
            </div>

            {/* Anomaly Classification Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-mono uppercase font-bold text-slate-400 block mb-1">
                  Defect Category:
                </label>
                <select
                  value={defectType}
                  onChange={(e) => setDefectType(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 font-mono focus:ring-1 focus:ring-cobalt focus:outline-none"
                >
                  <option value="Physiological Impossibility">Physiological Impossibility (e.g. Age &gt; 120)</option>
                  <option value="Physiological Inversion">Physiological Inversion (e.g. Systolic &lt; Diastolic)</option>
                  <option value="Duplicate Entry">Duplicate Entry (Exact clone of existing respondent)</option>
                  <option value="Jurisdiction Mismatch">Jurisdiction Mismatch (State does not match District ID)</option>
                  <option value="Domain Outlier">Domain Outlier (&gt;6 sigma statistical anomaly)</option>
                  <option value="Format Violation">Format Violation</option>
                </select>
              </div>

              <div>
                <label className="font-mono uppercase font-bold text-slate-400 block mb-1">
                  Defective Field / Attribute:
                </label>
                <select
                  value={defectField}
                  onChange={(e) => setDefectField(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 font-mono focus:ring-1 focus:ring-cobalt focus:outline-none"
                >
                  <option value="respondent_age">respondent_age</option>
                  <option value="district_id">district_id</option>
                  <option value="record_id">record_id (Duplicate Key)</option>
                  <option value="dependents_count">dependents_count</option>
                  <option value="systolic_bp">systolic_bp</option>
                  <option value="diastolic_bp">diastolic_bp</option>
                  <option value="monthly_income_inr">monthly_income_inr</option>
                </select>
              </div>

              <div>
                <label className="font-mono uppercase font-bold text-slate-400 block mb-1">
                  Recommended Remediation Action:
                </label>
                <select
                  value={remediationAction}
                  onChange={(e) => setRemediationAction(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 font-mono focus:ring-1 focus:ring-cobalt focus:outline-none"
                >
                  <option value="Quarantine Record">Quarantine Record from National Release</option>
                  <option value="Impute with Median">Impute with Regional Median Value</option>
                  <option value="Reject Cloned Duplicate">Reject Cloned Duplicate Record</option>
                  <option value="Mark for Re-enumeration">Mark for Field Re-enumeration</option>
                </select>
              </div>

              <div>
                <label className="font-mono uppercase font-bold text-slate-400 block mb-1">
                  Auditor Technical Explanation:
                </label>
                <textarea
                  value={auditorNote}
                  onChange={(e) => setAuditorNote(e.target.value)}
                  placeholder="Detail the statistical or biological justification for flagging this anomaly..."
                  rows={2}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 font-mono focus:ring-1 focus:ring-cobalt focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-5 mt-4 border-t border-slate-800">
              {flaggedAnomalies.some(f => f.record_id === inspectingRecord.record_id) ? (
                <button
                  onClick={handleRemoveFlag}
                  className="clay-btn bg-rust text-white px-4 py-2 text-xs font-bold"
                >
                  Remove Flag
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setInspectingRecord(null)}
                  className="clay-btn bg-slate-800 text-slate-300 px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFlag}
                  className="clay-btn bg-cobalt text-white px-5 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  <ShieldCheck size={15} /> Save Anomaly Flag
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
