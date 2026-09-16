import { PredictionRecord, StudentInputData, PredictionResponse } from '../types/student';

const STORAGE_KEY = 'edurisk_prediction_history';


const INITIAL_PREDICTIONS: PredictionRecord[] = [
  {
    id: 'rec-1',
    studentId: 'ST-2024-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    input: {
      student_id: 'ST-2024-001',
      age: 21,
      gender: 'Male',
      family_income: 42000,
      internet_access: 'Yes',
      study_hours_per_day: 1.5,
      attendance_rate: 58,
      assignment_delay_days: 5,
      travel_time_minutes: 65,
      part_time_job: 'Yes',
      scholarship: 'No',
      stress_index: 8,
      gpa: 2.1,
      semester_gpa: 1.9,
      cgpa: 2.0,
      semester: 4,
      department: 'Computing',
      parental_education: 'Secondary',
      failures: 2,
    },
    result: {
      dropout: 1,
      probability: 0.82,
      risk_level: 'High',
      contributing_factors: [
        'Critical Academic Standing (GPA < 2.2)',
        'Poor Attendance Rate (58%)',
        'High Academic Stress Index (8/10)',
        'Frequent Assignment Delays',
      ],
      recommendations: [
        'Immediate mandatory academic counseling',
        'Attendance monitoring contract',
        'Explore financial aid and study load adjustments',
      ],
      is_simulated: false,
    },
  },
  {
    id: 'rec-2',
    studentId: 'ST-2024-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    input: {
      student_id: 'ST-2024-002',
      age: 20,
      gender: 'Female',
      family_income: 95000,
      internet_access: 'Yes',
      study_hours_per_day: 5.5,
      attendance_rate: 94,
      assignment_delay_days: 0,
      travel_time_minutes: 20,
      part_time_job: 'No',
      scholarship: 'Yes',
      stress_index: 3,
      gpa: 3.8,
      semester_gpa: 3.75,
      cgpa: 3.78,
      semester: 3,
      department: 'Engineering',
      parental_education: 'Degree',
      failures: 0,
    },
    result: {
      dropout: 0,
      probability: 0.14,
      risk_level: 'Low',
      contributing_factors: [
        'Strong Academic Distinction (GPA: 3.8)',
        'High Attendance Consistency (94%)',
        'Disciplined Study Habits (5.5 hrs/day)',
      ],
      recommendations: [
        'Eligible for Dean\'s List and academic peer mentorship role',
      ],
      is_simulated: false,
    },
  },
  {
    id: 'rec-3',
    studentId: 'ST-2024-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    input: {
      student_id: 'ST-2024-003',
      age: 22,
      gender: 'Male',
      family_income: 60000,
      internet_access: 'Yes',
      study_hours_per_day: 3.0,
      attendance_rate: 72,
      assignment_delay_days: 2,
      travel_time_minutes: 45,
      part_time_job: 'Yes',
      scholarship: 'No',
      stress_index: 6,
      gpa: 2.7,
      semester_gpa: 2.6,
      cgpa: 2.65,
      semester: 5,
      department: 'Business',
      parental_education: 'Diploma',
      failures: 1,
    },
    result: {
      dropout: 1,
      probability: 0.56,
      risk_level: 'Medium',
      contributing_factors: [
        'Borderline Attendance (72%)',
        'Moderate Academic Performance (GPA: 2.7)',
        'Balancing Part-Time Work with Studies',
      ],
      recommendations: [
        'Bi-weekly progress check-ins with faculty advisor',
        'Time management workshop attendance',
      ],
      is_simulated: false,
    },
  },
];

export function getStoredPredictions(): PredictionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PREDICTIONS));
      return INITIAL_PREDICTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PREDICTIONS;
  }
}

export function savePredictionRecord(input: StudentInputData, result: PredictionResponse): PredictionRecord {
  const current = getStoredPredictions();
  const newRecord: PredictionRecord = {
    id: 'rec-' + Date.now(),
    studentId: input.student_id || `ST-${new Date().getFullYear()}-${String(current.length + 1).padStart(3, '0')}`,
    timestamp: new Date().toISOString(),
    input,
    result,
  };

  const updated = [newRecord, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save prediction record in localStorage', err);
  }
  return newRecord;
}

export function clearPredictionHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history', err);
  }
}

export function getStats() {
  const records = getStoredPredictions();

  const baseTotal = 1250;
  const baseHigh = 180;
  const baseMed = 320;
  const baseLow = 750;

  const newHigh = records.filter(r => r.result.risk_level === 'High').length;
  const newMed = records.filter(r => r.result.risk_level === 'Medium').length;
  const newLow = records.filter(r => r.result.risk_level === 'Low').length;

  return {
    total: baseTotal + records.length - INITIAL_PREDICTIONS.length,
    highRisk: baseHigh + (newHigh - 1),
    mediumRisk: baseMed + (newMed - 1),
    lowRisk: baseLow + (newLow - 1),
  };
}
