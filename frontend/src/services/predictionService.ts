import axios from 'axios';
import { StudentInputData, PredictionResponse, RiskLevel } from '../types/student';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

/**
 * Intelligent client-side heuristic simulation that mimics the trained ML model
 * if the backend is not currently running. Allows full offline UI testing & demos.
 */
export function simulateDropoutPrediction(input: StudentInputData): PredictionResponse {
  let riskScore = 0;
  const factors: string[] = [];
  const recommendations: string[] = [];

  // 1. GPA Analysis (Weight: 30%)
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

  // 2. Attendance Analysis (Weight: 25%)
  if (input.attendance_rate < 60) {
    riskScore += 30;
    factors.push(`Severe Attendance Deficit (${input.attendance_rate}%)`);
    recommendations.push('Implement attendance warning protocol and identify transport/health obstacles.');
  } else if (input.attendance_rate < 75) {
    riskScore += 15;
    factors.push(`Sub-optimal Attendance (${input.attendance_rate}%)`);
    recommendations.push('Encourage consistent lecture and practical lab engagement.');
  }

  // 3. Study Habits & Engagement (Weight: 15%)
  if (input.study_hours_per_day < 2) {
    riskScore += 15;
    factors.push(`Insufficient Daily Study Time (${input.study_hours_per_day} hrs/day)`);
    recommendations.push('Provide structured study schedule and time management workshop.');
  } else if (input.study_hours_per_day < 3) {
    riskScore += 8;
  }

  // 4. Assignment Delays (Weight: 10%)
  if (input.assignment_delay_days >= 4) {
    riskScore += 15;
    factors.push(`Frequent Assignment Delays (${input.assignment_delay_days} days avg delay)`);
    recommendations.push('Offer deadline planning support and breaking projects into milestones.');
  } else if (input.assignment_delay_days >= 2) {
    riskScore += 8;
    factors.push(`Occasional Assignment Delays (${input.assignment_delay_days} days)`);
  }

  // 5. Stress Level & Travel Time (Weight: 10%)
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

  // 6. Socioeconomic & Support (Weight: 10%)
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

  // Normalize probability between 5% and 96%
  const normalizedProbability = Math.min(Math.max(riskScore / 100, 0.05), 0.96);

  let riskLevel: RiskLevel = 'Low';
  if (normalizedProbability >= 0.70) {
    riskLevel = 'High';
  } else if (normalizedProbability >= 0.40) {
    riskLevel = 'Medium';
  }

  // Defaults if student is performing well
  if (factors.length === 0) {
    factors.push('Strong Overall Academic Performance and Regular Attendance');
    recommendations.push('Continue encouraging current academic habits and extracurricular leadership.');
  }

  return {
    dropout: normalizedProbability >= 0.5 ? 1 : 0,
    probability: Math.round(normalizedProbability * 100) / 100,
    risk_level: riskLevel,
    contributing_factors: factors,
    recommendations: recommendations,
    is_simulated: true,
  };
}

/**
 * Predicts student dropout risk.
 * Tries the real backend API endpoint first.
 * If backend is offline, falls back to the simulated ML heuristic with notification.
 */
export async function predictStudentDropout(data: StudentInputData): Promise<PredictionResponse> {
  try {
    const response = await apiClient.post<PredictionResponse>('/predict', data);
    
    // Enrich response with default factors/recommendations if backend returns raw probability
    const result = response.data;
    const probability = typeof result.probability === 'number' 
      ? (result.probability > 1 ? result.probability / 100 : result.probability)
      : 0.5;

    let derivedRisk: RiskLevel = result.risk_level;
    if (!derivedRisk) {
      if (probability >= 0.70) derivedRisk = 'High';
      else if (probability >= 0.40) derivedRisk = 'Medium';
      else derivedRisk = 'Low';
    }

    const fallbackFactors = simulateDropoutPrediction(data).contributing_factors;
    const fallbackRecommendations = simulateDropoutPrediction(data).recommendations;

    return {
      dropout: result.dropout ?? (probability >= 0.5 ? 1 : 0),
      probability: Math.round(probability * 100) / 100,
      risk_level: derivedRisk,
      contributing_factors: result.contributing_factors?.length ? result.contributing_factors : fallbackFactors,
      recommendations: result.recommendations?.length ? result.recommendations : fallbackRecommendations,
      is_simulated: false,
    };
  } catch (err: any) {
    console.warn('Backend prediction endpoint unavailable or failed. Utilizing ML simulation fallback.', err?.message);
    // Simulate delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 600));
    return simulateDropoutPrediction(data);
  }
}

/**
 * Health check to see if backend is running
 */
export async function checkBackendStatus(): Promise<boolean> {
  try {
    await apiClient.get('/', { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}
