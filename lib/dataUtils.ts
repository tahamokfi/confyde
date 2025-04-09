import { supabase } from '@/lib/supabaseClient';

/**
 * Fetch projects for the current user
 */
export const fetchProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to fetch projects' };
  }
};

/**
 * Fetch scenarios for a specific project
 */
export const fetchScenarios = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('project_id', projectId)
      .order('name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to fetch scenarios' };
  }
};

/**
 * Create a new project
 */
export const createProject = async (projectData: {
  name: string;
  description: string;
  start_date: string;
  company_id: string;
  created_by: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to create project' };
  }
};

/**
 * Create a new scenario
 */
export const createScenario = async (scenarioData: {
  name: string;
  description: string;
  start_date: string;
  project_id: string;
  company_id: string;
  sample_size?: number;
  inclusion_criteria?: string;
  investigational_arm?: string;
  control_arm?: string;
  primary_end_point?: string;
  secondary_end_point?: string;
  exploratory_end_point?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('scenarios')
      .insert([scenarioData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to create scenario' };
  }
};

/**
 * Update a scenario
 */
export const updateScenario = async (
  scenarioId: string,
  scenarioData: Partial<{
    name: string;
    description: string;
    start_date: string;
    sample_size: number;
    inclusion_criteria: string;
    investigational_arm: string;
    control_arm: string;
    primary_end_point: string;
    secondary_end_point: string;
    exploratory_end_point: string;
  }>
) => {
  try {
    const { data, error } = await supabase
      .from('scenarios')
      .update(scenarioData)
      .eq('id', scenarioId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to update scenario' };
  }
};

/**
 * Get user company ID
 */
export const getUserCompanyId = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('company_id')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { companyId: data?.company_id, error: null };
  } catch (error: any) {
    return { companyId: null, error: error.message || 'Failed to get user company' };
  }
}; 