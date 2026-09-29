import authApi from '../auth/authApi';

export interface SubmitEvidencePayload {
  competency_id: string;
  source_type: string;
  source_reference?: string;
  score_raw: number;
  explanation: string;
}

export async function submitEvidence(payload: SubmitEvidencePayload): Promise<void> {
  await authApi.post('evidence/records/submit/', payload);
}
