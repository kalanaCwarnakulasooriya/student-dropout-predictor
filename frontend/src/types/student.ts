export type Gender = 'Male' | 'Female' | 'Other';
export type BinaryChoice = 'Yes' | 'No';
export type ParentalEducation = 'Primary' | 'Secondary' | 'Diploma' | 'Higher' | 'Degree' | 'Postgraduate';
export type Department = 
  | 'Computing'
  | 'Engineering'
  | 'Business'
  | 'Science'
  | 'Humanities'
  | 'Medicine';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface StudentInputData {
  student_id?: string;
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
  semester: number;
  department: Department;
  parental_education: ParentalEducation;
}

export interface PredictionResponse {
  dropout: number; // 1 for Yes, 0 for No
  probability: number; // 0.0 to 1.0 (or percentage)
  risk_level: RiskLevel;
  contributing_factors?: string[];
  recommendations?: string[];
  is_simulated?: boolean;
}

export interface PredictionRecord {
  id: string;
  studentId: string;
  timestamp: string;
  input: StudentInputData;
  result: PredictionResponse;
}

export interface FormValidationErrors {
  [key: string]: string | undefined;
}
