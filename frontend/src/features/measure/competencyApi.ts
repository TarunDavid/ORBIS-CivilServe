import authApi from '../auth/authApi';

export interface CompetencyCategory {
  id: string;
  name: string;
  description: string;
}

export interface Competency {
  id: string;
  name: string;
  code: string;
  category: CompetencyCategory;
  description: string;
}

export interface RoleRequirement {
  id: string;
  competency: Competency;
  target_proficiency: number;
  weight: number;
  current_proficiency: number; // For now mocked as 0 by backend
}

export async function fetchMyCompetencyRequirements(): Promise<RoleRequirement[]> {
  const resp = await authApi.get<RoleRequirement[]>('competency/requirements/my_requirements/');
  return resp.data;
}
