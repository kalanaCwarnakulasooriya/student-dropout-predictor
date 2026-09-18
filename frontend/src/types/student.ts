export type Gender = 'Male' | 'Female';
export type BinaryChoice = 'Yes' | 'No';
export type ParentalEducation = 'Bachelor' | 'High School' | 'Master' | 'PhD';
export type Department = 'Arts' | 'Business' | 'CS' | 'Engineering' | 'Science';
export type Semester = 'Year 1' | 'Year 2' | 'Year 3' | 'Year 4';

export type RiskLevel = 'Low' | 'Medium' | 'High';


export interface StudentInputData {
  age: number;
  gender: Gender;
  family_income: number;
  internet_access: BinaryChoice;
  study_hours_per_day: number;
  attendance_rate: number;
  assignment_delay_days: number;
  travel_time_minutes: number;
  part_time_job: BinaryChoice;
  scholarship: BinaryChoice;
  stress_index: number;
  gpa: number;
  semester_gpa: number;
  cgpa: number;
  semester: Semester;
  department: Department;
  parental_education: ParentalEducation;
  failures: number;
  student_id?: number | string;
}


export interface PredictionResponse {
  dropout: number;
  probability: number;
  risk_level: RiskLevel;
  contributing_factors?: string[];
  recommendations?: string[];
  is_simulated?: boolean;
  message?: string;
}


export interface PredictionRecord {
  id: string;
  timestamp: string;
  input: StudentInputData;
  result: PredictionResponse;
}

export interface FormValidationErrors {
  [key: string]: string | undefined;
}


export interface BackendPredictionInput {
  age: number;
  gender: string;
  gpa: number;
  semester_gpa: number;
  cgpa: number;
  attendance: number;
  study_hours: number;
  failures: number;
  family_income: number;
  financial_stress: number;
  department?: string;
  semester?: string;
  assignment_delay_days?: number;
  travel_time_minutes?: number;
  stress_index?: number;
  parental_education?: string;
  part_time_job?: string;
  scholarship?: string;
  internet_access?: string;
}


export interface BackendPredictionResponse {
  prediction: string;
  probability: number;
  riskLevel: string;
  keyRiskFactors: string[];
  recommendations: string[];
  message: string;
}


export interface BackendHistoryItem {
  id: number;
  age: number;
  gender: string;
  gpa: number;
  semester_gpa: number;
  cgpa: number;
  attendance: number;
  study_hours: number;
  failures: number;
  family_income: number;
  financial_stress: number;
  prediction: string;
  probability: number;
  risk_level: string;
  evaluated_at: string;
  department?: string;
  semester?: string;
  assignment_delay_days?: number;
  travel_time_minutes?: number;
  stress_index?: number;
  parental_education?: string;
  part_time_job?: string;
  scholarship?: string;
  internet_access?: string;
  key_risk_factors?: string[];
  recommendations?: string[];
}
