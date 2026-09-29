import authApi from '../auth/authApi';
import { Competency } from './competencyApi';

export interface CompetencyLab {
  id: string;
  competency: Competency;
  title: string;
  description: string;
  environment_type: string;
}

export interface LabSession {
  id: string;
  lab: CompetencyLab;
  user_input: string;
  llm_score_raw: number | null;
  llm_feedback: string;
  status: string;
}

export async function fetchLabsForCompetency(competencyId: string): Promise<CompetencyLab[]> {
  const resp = await authApi.get<CompetencyLab[]>(`labs/catalogs/?competency=${competencyId}`);
  return resp.data;
}

export async function createLabSession(labId: string): Promise<LabSession> {
  const resp = await authApi.post<LabSession>('labs/sessions/', {
    lab_id: labId, // The serializer might not accept lab_id directly like this if it's nested or read_only. Let's send it.
    // Wait, by default DRF ModelViewSet expects `lab` as the foreign key field if we didn't specify `lab_id`. Let's pass `lab`.
    lab: labId
  });
  return resp.data;
}

export async function submitLabSession(sessionId: string, userInput: string): Promise<LabSession> {
  const resp = await authApi.post<LabSession>(`labs/sessions/${sessionId}/submit/`, {
    user_input: userInput
  });
  return resp.data;
}
