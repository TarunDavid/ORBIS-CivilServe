import authApi from '../auth/authApi';
import type { Competency } from './competencyApi';

export interface CompetencyLab {
  id: string;
  competency: Competency;
  title: string;
  description: string;
  environment_type: 'crisis_simulation' | 'data_detective' | 'python_notebook' | 'sql_terminal' | 'policy_canvas' | string;
  scenario_data?: any;
  is_active?: boolean;
}

export interface LabSession {
  id: string;
  lab: CompetencyLab;
  user_input: string;
  session_state?: any;
  llm_score_raw: number | null;
  llm_feedback: string;
  status: 'in_progress' | 'evaluating' | 'completed' | string;
  created_at?: string;
  completed_at?: string;
}

export async function fetchAllLabs(): Promise<CompetencyLab[]> {
  const resp = await authApi.get<CompetencyLab[]>('labs/catalogs/');
  return resp.data;
}

export async function fetchLabsForCompetency(competencyId: string): Promise<CompetencyLab[]> {
  const resp = await authApi.get<CompetencyLab[]>(`labs/catalogs/?competency=${competencyId}`);
  return resp.data;
}

export async function createLabSession(labId: string): Promise<LabSession> {
  const resp = await authApi.post<LabSession>('labs/sessions/', {
    lab_id: labId,
  });
  return resp.data;
}

export async function stepLabSession(
  sessionId: string,
  sessionState: any,
  userInput?: string
): Promise<LabSession> {
  const resp = await authApi.post<LabSession>(`labs/sessions/${sessionId}/step/`, {
    session_state: sessionState,
    user_input: userInput,
  });
  return resp.data;
}

export async function submitLabSession(
  sessionId: string,
  userInput: string,
  sessionState?: any
): Promise<LabSession> {
  const resp = await authApi.post<LabSession>(`labs/sessions/${sessionId}/submit/`, {
    user_input: userInput,
    session_state: sessionState,
  });
  return resp.data;
}
