export interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  company_id: string;
  created_by: string;
  created_at?: string;
}

export interface Scenario {
  id: string;
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
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  company_id: string;
  first_name?: string;
  last_name?: string;
}

export interface FormData {
  [key: string]: string | number | boolean | Array<string | number>;
} 