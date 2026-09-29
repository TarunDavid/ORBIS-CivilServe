import { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Loader2,
  FileCheck
} from 'lucide-react';
import { fetchMyCompetencyCard, type CompetencyCardData } from './competencyCardApi';
import CompetencyRadarChart from './CompetencyRadarChart';

interface Props {
  onClose?: () => void;
  officialId?: string;
  isStandalonePage?: boolean;
}

export default function CompetencyCardModal({ onClose, isStandalonePage = false }: Props) {
  const [data, setData] = useState<CompetencyCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const cardData = await fetchMyCompetencyCard();
        setData(cardData);
      } catch (err: any) {
        console.error('Failed to fetch competency card', err);
        setError(err.message || 'Failed to load competency card');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={isStandalonePage ? "min-h-screen flex items-center justify-center bg-canvas" : "fixed inset-0 bg-structural/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"}>
        <div className="bg-white rounded-xl p-8 flex flex-col items-center shadow-xl">
          <Loader2 className="animate-spin text-cobalt mb-4" size={48} />
          <h3 className="font-syne font-bold text-xl text-structural">Loading Competency Passport...</h3>
          <p className="text-on-surface-variant text-sm mt-1">Verifying evidence ledger seals</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={isStandalonePage ? "min-h-screen flex items-center justify-center bg-canvas" : "fixed inset-0 bg-structural/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"}>
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-xl">
          <AlertCircle className="text-rust mx-auto mb-3" size={48} />
          <h3 className="font-syne font-bold text-xl text-structural mb-2">Passport Unavailable</h3>
          <p className="text-on-surface-variant text-sm mb-4">{error || 'No competency data found.'}</p>
          {onClose && (
            <button onClick={onClose} className="clay-btn bg-structural text-white px-4 py-2">
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  const { official, summary, competencies, evidence_ledger } = data;

  const content = (
    <div className="bg-white rounded-2xl w-full max-w-5xl flex flex-col overflow-hidden shadow-2xl border-4 border-cobalt font-jakarta print:border-none print:shadow-none print:max-w-none">
      {/* Credential Header */}
      <div className="bg-slate-900 text-white p-6 md:p-8 border-b-4 border-gold relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-gold shadow-inner flex-shrink-0">
              <Award size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold tracking-widest uppercase bg-gold/20 text-gold px-2.5 py-0.5 rounded-full border border-gold/30">
                  OFFICIAL STATISTICAL CREDENTIAL
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-800">
                  <ShieldCheck size={12} /> VERIFIED
                </span>
              </div>
              <h1 className="font-syne text-3xl font-extrabold tracking-tight text-white">
                {official.full_name}
              </h1>
              <p className="text-slate-300 text-sm font-medium mt-0.5">
                {official.designation} • {official.department_name} ({official.department_code})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden self-end md:self-auto">
            <button
              onClick={handlePrint}
              className="clay-btn bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 text-xs flex items-center gap-1.5 border border-white/10 rounded-lg cursor-pointer transition-colors"
              title="Print official skill passport"
            >
              <Printer size={15} /> Print / Export
            </button>
            <button
              onClick={handleCopyLink}
              className="clay-btn bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 text-xs flex items-center gap-1.5 border border-white/10 rounded-lg cursor-pointer transition-colors"
              title="Copy verification link"
            >
              {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
              {copied ? 'Copied' : 'Share'}
            </button>
            {onClose && (
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white cursor-pointer ml-1"
              >
                <X size={22} />
              </button>
            )}
          </div>
        </div>

        {/* Security Seal Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span>EMPLOYEE ID: <strong className="text-white font-mono">{official.employee_id}</strong></span>
            <span>•</span>
            <span>CADRE: <strong className="text-white">{official.cadre}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-white/5">
            <FileCheck size={13} className="text-gold" />
            <span>SEAL: <span className="text-gold font-mono">{official.verification_seal}</span></span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 md:p-8 bg-canvas space-y-8 overflow-y-auto max-h-[calc(85vh-160px)] print:max-h-none print:overflow-visible">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-structural/10 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cobalt/10 flex items-center justify-center text-cobalt font-syne font-black text-lg">
              {summary.readiness_index}%
            </div>
            <div>
              <div className="text-xs text-on-surface-variant font-medium">Readiness Index</div>
              <div className="text-base font-bold text-structural">
                {summary.readiness_index >= 80 ? 'Mastery' : summary.readiness_index >= 50 ? 'Proficient' : 'Developing'}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-structural/10 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-xs text-on-surface-variant font-medium">Target Met</div>
              <div className="text-base font-bold text-structural">
                {summary.demonstrated_competencies_count} / {summary.required_competencies_count}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-structural/10 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertCircle size={24} />
            </div>
            <div>
              <div className="text-xs text-on-surface-variant font-medium">Critical Gaps</div>
              <div className="text-base font-bold text-structural">
                {summary.critical_gaps_count} Competencies
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-structural/10 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-xs text-on-surface-variant font-medium">Evidence Ledger</div>
              <div className="text-base font-bold text-structural">
                {summary.total_evidence_records} Verified Events
              </div>
            </div>
          </div>
        </div>

        {/* Radar & Competency Matrix Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Radar Chart */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-structural/10 shadow-sm flex flex-col items-center">
            <h3 className="font-syne font-bold text-lg text-structural self-start mb-2">
              Demonstrated Competency Topology
            </h3>
            <p className="text-xs text-on-surface-variant self-start mb-6">
              Multidimensional alignment against Indian Statistical System role requirements (Scale: L1 to L5).
            </p>
            <CompetencyRadarChart competencies={competencies} size={340} />
          </div>

          {/* Competency Matrix Cards */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-structural/10 shadow-sm">
            <h3 className="font-syne font-bold text-lg text-structural mb-1">
              Proficiency Benchmark Matrix
            </h3>
            <p className="text-xs text-on-surface-variant mb-5">
              Verified scores backed by authentic simulation & assessment evidence.
            </p>

            <div className="space-y-3.5">
              {competencies.map((comp) => {
                const isMet = comp.current_proficiency >= comp.target_proficiency;
                const isCritical = comp.gap > 2;

                return (
                  <div 
                    key={comp.id} 
                    className="p-3.5 rounded-xl border border-structural/10 bg-canvas/30 hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-structural bg-surface px-2 py-0.5 rounded border border-structural/10">
                          {comp.code}
                        </span>
                        <h4 className="font-bold text-structural text-sm">
                          {comp.name}
                        </h4>
                        <span className="text-[10px] font-mono text-on-surface-variant">
                          • {comp.category}
                        </span>
                      </div>

                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isMet 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isCritical 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isMet ? 'Target Met' : isCritical ? 'Critical Gap' : `Gap: -${comp.gap}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-on-surface-variant">
                        Demonstrated: <strong className="text-emerald-700 font-mono">Level {comp.current_proficiency}</strong> / 5
                      </span>
                      <span className="text-cobalt font-medium">
                        Target: <strong className="font-mono">Level {comp.target_proficiency}</strong>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-surface rounded-full overflow-hidden relative border border-structural/10">
                      <div 
                        className={`h-full rounded-full ${isMet ? 'bg-emerald-600' : isCritical ? 'bg-rose-600' : 'bg-amber-500'}`}
                        style={{ width: `${(comp.current_proficiency / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Verified Evidence Ledger */}
        <div className="bg-white p-6 rounded-2xl border border-structural/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-syne font-bold text-lg text-structural flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={20} />
                Immutable Evidence Ledger
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Audit trail of verified simulations, labs, and evaluation events for this credential.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-surface px-2.5 py-1 rounded border border-structural/10">
              {evidence_ledger.length} Verified Entries
            </span>
          </div>

          {evidence_ledger.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant italic text-sm border-2 border-dashed border-structural/10 rounded-xl">
              No evidence events recorded yet. Complete an Experiential Lab or Knowledge Assessment to generate evidence.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-jakarta">
                <thead>
                  <tr className="border-b border-structural/10 text-on-surface-variant font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Competency</th>
                    <th className="py-2.5 px-3">Evidence Source</th>
                    <th className="py-2.5 px-3">Raw Score</th>
                    <th className="py-2.5 px-3">Proficiency Awarded</th>
                    <th className="py-2.5 px-3">Verification Seal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-structural/5">
                  {evidence_ledger.map((ev) => (
                    <tr key={ev.id} className="hover:bg-canvas/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-on-surface-variant whitespace-nowrap">
                        {new Date(ev.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <strong className="text-structural block">{ev.competency_name}</strong>
                        <span className="text-[10px] font-mono text-on-surface-variant">{ev.competency_code}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-surface px-2 py-0.5 rounded font-mono text-[11px] text-structural border border-structural/10">
                          {ev.source_type_display}
                        </span>
                        {ev.explanation && (
                          <div className="text-[11px] text-on-surface-variant mt-1 line-clamp-1 italic">
                            "{ev.explanation}"
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-structural">
                        {ev.score_raw}/100
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono text-[11px]">
                          Level {ev.score_proficiency}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-gold-dark font-bold whitespace-nowrap">
                        {ev.verification_seal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  if (isStandalonePage) {
    return (
      <div className="min-h-screen bg-canvas p-4 md:p-8 flex justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-structural/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {content}
    </div>
  );
}
