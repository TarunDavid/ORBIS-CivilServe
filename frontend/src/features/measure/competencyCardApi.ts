import authApi from '../auth/authApi';

export interface OfficialInfo {
  id: string;
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  employee_id: string;
  designation: string;
  role: string;
  role_title: string;
  department_code: string;
  department_name: string;
  verification_seal: string;
  cadre: string;
}

export interface CompetencyCardSummary {
  readiness_index: number;
  demonstrated_competencies_count: number;
  required_competencies_count: number;
  critical_gaps_count: number;
  total_evidence_records: number;
  last_evaluated: string | null;
}

export interface LatestEvidence {
  source_type: string;
  source_type_display: string;
  score_raw: number;
  score_proficiency: number;
  timestamp: string;
}

export interface CompetencyCardItem {
  id: string;
  code: string;
  name: string;
  category: string;
  target_proficiency: number;
  current_proficiency: number;
  weight: number;
  gap: number;
  status: 'met' | 'gap' | 'critical_gap';
  evidence_count: number;
  latest_evidence: LatestEvidence | null;
}

export interface EvidenceLedgerItem {
  id: string;
  competency_id: string;
  competency_code: string;
  competency_name: string;
  source_type: string;
  source_type_display: string;
  source_reference: string;
  score_raw: number;
  score_proficiency: number;
  explanation: string;
  timestamp: string;
  verification_seal: string;
}

export interface CompetencyCardData {
  official: OfficialInfo;
  summary: CompetencyCardSummary;
  competencies: CompetencyCardItem[];
  evidence_ledger: EvidenceLedgerItem[];
}

export async function fetchMyCompetencyCard(): Promise<CompetencyCardData> {
  const resp = await authApi.get<CompetencyCardData>('competency/card/me/');
  return resp.data;
}

export async function fetchOfficialCompetencyCard(officialId: string): Promise<CompetencyCardData> {
  const resp = await authApi.get<CompetencyCardData>(`competency/card/${officialId}/`);
  return resp.data;
}
