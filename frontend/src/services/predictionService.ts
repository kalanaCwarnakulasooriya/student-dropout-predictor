import axios from 'axios';
import {
  StudentInputData,
  PredictionResponse,
  RiskLevel,
  BackendPredictionInput,
  BackendPredictionResponse,
  BackendHistoryItem,
  PredictionRecord,
} from '../types/student';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});


function toBackendPayload(input: StudentInputData): BackendPredictionInput {
  return {
    age:               input.age,
    gender:            input.gender,
    gpa:               input.gpa,
    semester_gpa:      input.semester_gpa,
    cgpa:              input.cgpa,
    attendance:        input.attendance_rate,
    study_hours:       Math.round(input.study_hours_per_day * 7 * 10) / 10,
    failures:          input.failures ?? 0,
    family_income:     input.family_income,
    financial_stress:  Math.min(5, Math.max(1, Math.round(input.stress_index / 2))),
  };
}


function fromBackendResponse(res: BackendPredictionResponse): PredictionResponse {
  const risk = (res.riskLevel as RiskLevel) || 'Low';
  return {
    dropout:              res.prediction === 'Dropout' ? 1 : 0,
    probability:          res.probability,
    risk_level:           risk,
    contributing_factors: res.keyRiskFactors ?? [],
    recommendations:      res.recommendations ?? [],
    is_simulated:         false,
    message:              res.message,
  };
}


export function simulateDropoutPrediction(input: StudentInputData): PredictionResponse {
  let riskScore = 0;
  const factors: string[] = [];
  const recommendations: string[] = [];

  const avgGpa = (input.gpa + input.semester_gpa + input.cgpa) / 3;
  if (avgGpa < 2.0) {
    riskScore += 35;
    factors.push(`Critical Academic Standing (Avg GPA: ${avgGpa.toFixed(2)})`);
    recommendations.push('Immediate mandatory peer tutoring and academic recovery counseling.');
  } else if (avgGpa < 2.5) {
    riskScore += 20;
    factors.push(`Below Average Academic Performance (Avg GPA: ${avgGpa.toFixed(2)})`);
    recommendations.push('Schedule fortnightly academic review meetings with course advisor.');
  } else if (avgGpa < 3.0) {
    riskScore += 10;
  }

  if (input.attendance_rate < 60) {
    riskScore += 30;
    factors.push(`Severe Attendance Deficit (${input.attendance_rate}%)`);
    recommendations.push('Implement attendance warning protocol and identify transport/health obstacles.');
  } else if (input.attendance_rate < 75) {
    riskScore += 15;
    factors.push(`Sub-optimal Attendance (${input.attendance_rate}%)`);
    recommendations.push('Encourage consistent lecture and practical lab engagement.');
  }

  if (input.study_hours_per_day < 2) {
    riskScore += 15;
    factors.push(`Insufficient Daily Study Time (${input.study_hours_per_day} hrs/day)`);
    recommendations.push('Provide structured study schedule and time management workshop.');
  } else if (input.study_hours_per_day < 3) {
    riskScore += 8;
  }

  if (input.assignment_delay_days >= 4) {
    riskScore += 15;
    factors.push(`Frequent Assignment Delays (${input.assignment_delay_days} days avg delay)`);
    recommendations.push('Offer deadline planning support and breaking projects into milestones.');
  } else if (input.assignment_delay_days >= 2) {
    riskScore += 8;
    factors.push(`Occasional Assignment Delays (${input.assignment_delay_days} days)`);
  }

  if (input.stress_index >= 8) {
    riskScore += 12;
    factors.push(`Severe Stress & Burnout Indicators (Index: ${input.stress_index}/10)`);
    recommendations.push('Connect student with university mental wellness and counseling services.');
  } else if (input.stress_index >= 6) {
    riskScore += 6;
  }

  if (input.travel_time_minutes > 75) {
    riskScore += 8;
    factors.push(`Excessive Commute Distance (${input.travel_time_minutes} minutes)`);
    recommendations.push('Explore student accommodation or flexible hybrid learning materials.');
  }

  if (input.internet_access === 'No') {
    riskScore += 8;
    factors.push('Lack of Reliable High-Speed Internet Access at Home');
    recommendations.push('Grant access to campus computing labs and portable data allowances.');
  }

  if (input.family_income < 35000 && input.scholarship === 'No') {
    riskScore += 10;
    factors.push('High Financial Vulnerability (No active scholarship)');
    recommendations.push('Screen student eligibility for student hardship grants and emergency bursaries.');
  }

  if (input.part_time_job === 'Yes' && input.study_hours_per_day < 2) {
    riskScore += 8;
    factors.push('Conflict between Part-Time Employment and Study Commitments');
  }

  const normalizedProbability = Math.min(Math.max(riskScore / 100, 0.05), 0.96);

  let riskLevel: RiskLevel = 'Low';
  if (normalizedProbability >= 0.70) {
    riskLevel = 'High';
  } else if (normalizedProbability >= 0.40) {
    riskLevel = 'Medium';
  }

  if (factors.length === 0) {
    factors.push('Strong Overall Academic Performance and Regular Attendance');
    recommendations.push('Continue encouraging current academic habits and extracurricular leadership.');
  }

  return {
    dropout:              normalizedProbability >= 0.5 ? 1 : 0,
    probability:          Math.round(normalizedProbability * 100) / 100,
    risk_level:           riskLevel,
    contributing_factors: factors,
    recommendations:      recommendations,
    is_simulated:         true,
  };
}


export async function predictStudentDropout(data: StudentInputData): Promise<PredictionResponse> {
  try {
    const payload = toBackendPayload(data);
    const response = await apiClient.post<BackendPredictionResponse>('/api/predictions', payload);
    return fromBackendResponse(response.data);
  } catch (err: any) {
    console.warn(
      '[predictionService] Backend unavailable — falling back to client-side simulation.',
      err?.message,
    );
    await new Promise((resolve) => setTimeout(resolve, 600));
    return simulateDropoutPrediction(data);
  }
}


export async function fetchPredictionHistory(): Promise<PredictionRecord[] | null> {
  try {
    const response = await apiClient.get<BackendHistoryItem[]>('/api/predictions/history', {
      timeout: 4000,
    });

    return response.data.map((item): PredictionRecord => {
      const risk = (item.risk_level as RiskLevel) || 'Low';

      const input: StudentInputData = {
        student_id:            `REC-${String(item.id).padStart(4, '0')}`,
        age:                   item.age,
        gender:                item.gender as any,
        gpa:                   item.gpa,
        semester_gpa:          item.semester_gpa,
        cgpa:                  item.cgpa,
        attendance_rate:       item.attendance,
        study_hours_per_day:   Math.round((item.study_hours / 7) * 10) / 10,
        failures:              item.failures,
        family_income:         item.family_income,
        stress_index:          Math.min(10, Math.max(1, item.financial_stress * 2)),
        internet_access:       'Yes',
        assignment_delay_days: 0,
        travel_time_minutes:   0,
        part_time_job:         'No',
        scholarship:           'No',
        semester:              'Year 1',
        department:            'CS',
        parental_education:    'Bachelor',
      };

      const result: PredictionResponse = {
        dropout:    item.prediction === 'Dropout' ? 1 : 0,
        probability: item.probability,
        risk_level:  risk,
        is_simulated: false,
      };

      return {
        id:        String(item.id),
        studentId: `REC-${String(item.id).padStart(4, '0')}`,
        timestamp: item.evaluated_at,
        input,
        result,
      };
    });
  } catch (err: any) {
    console.warn(
      '[predictionService] History endpoint unavailable — will use localStorage.',
      err?.message,
    );
    return null;
  }
}


export async function checkBackendStatus(): Promise<boolean> {
  try {
    await apiClient.get('/', { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}
