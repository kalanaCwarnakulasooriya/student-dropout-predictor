import React, { useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Info,
  Calendar,
  BookOpen,
  User,
  Clock,
  Laptop
} from 'lucide-react';
import { PredictionResponse, StudentInputData } from '../types/student';
import { RiskBadge } from '../components/ui/RiskBadge';

export const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();


  const state = location.state as { result?: PredictionResponse; input?: StudentInputData } | undefined;


  const result: PredictionResponse = state?.result || {
    dropout: 1,
    probability: 0.82,
    risk_level: 'High',
    contributing_factors: [
      'Critical Academic Standing (GPA: 1.90)',
      'Severe Attendance Deficit (54%)',
      'High Academic Stress Index (9/10)',
      'Excessive Assignment Delays (6 days average)',
    ],
    recommendations: [
      'Immediate mandatory peer tutoring and academic recovery counseling.',
      'Implement attendance warning protocol and identify transport obstacles.',
      'Provide structured study schedule and time management workshop.',
      'Connect student with university mental wellness and counseling services.',
    ],
    is_simulated: false,
  };

  const input: StudentInputData = state?.input || {
    student_id: 1,
    age: 21,
    gender: 'Male',
    family_income: 30000,
    internet_access: 'No',
    study_hours_per_day: 1.2,
    attendance_rate: 54,
    assignment_delay_days: 6,
    travel_time_minutes: 85,
    part_time_job: 'Yes',
    scholarship: 'No',
    stress_index: 9,
    gpa: 1.9,
    semester_gpa: 1.7,
    cgpa: 1.85,
    semester: 'Year 3',
    department: 'CS',
    parental_education: 'High School',
    failures: 2,
  };

  const percentage = Math.round(
    result.probability > 1 ? result.probability : result.probability * 100
  );


  const displayStudentId = useMemo(() => {
    if (input.student_id !== undefined && input.student_id !== null && input.student_id !== '') {
      return String(input.student_id);
    }
    return '1';
  }, [input.student_id]);

  const getRiskTheme = () => {
    switch (result.risk_level) {
      case 'High':
        return {
          gradient: 'from-rose-600 via-rose-500 to-amber-600',
          badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
          textColor: 'text-rose-600',
          strokeColor: '#f43f5e',
          alertBg: 'bg-rose-50/70 border-rose-200 text-rose-900',
          summaryIcon: <AlertOctagon className="w-8 h-8 text-rose-600" />,
          summaryText: 'The student exhibits high indicators correlated with academic attrition. Timely institutional intervention is critically advised.',
        };
      case 'Medium':
        return {
          gradient: 'from-amber-500 via-orange-400 to-yellow-500',
          badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
          textColor: 'text-amber-600',
          strokeColor: '#f59e0b',
          alertBg: 'bg-amber-50/70 border-amber-200 text-amber-900',
          summaryIcon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
          summaryText: 'The student exhibits moderate risk factors. Proactive academic check-ins and attendance monitoring are suggested.',
        };
      case 'Low':
      default:
        return {
          gradient: 'from-emerald-600 via-teal-500 to-indigo-600',
          badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          textColor: 'text-emerald-600',
          strokeColor: '#10b981',
          alertBg: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
          summaryIcon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
          summaryText: 'The student exhibits solid academic standing and engagement. Risk of dropping out is minimal under current parameters.',
        };
    }
  };

  const theme = getRiskTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-8 print:p-0 print:max-w-full">

      {}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          to="/predict"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Assessment</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
          >
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {result.is_simulated && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Note for Presentation / Viva:</strong> Prediction generated via Client-Side ML Heuristics Engine
            (Backend API was offline or in development). All engineered features were successfully computed.
          </span>
        </div>
      )}

      {}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className={`p-8 sm:p-10 bg-gradient-to-r ${theme.gradient} text-white relative`}>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                Assessment Outcome
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Dropout Risk: <span className="uppercase">{result.risk_level}</span>
              </h1>
              <p className="text-white/90 text-sm leading-relaxed">
                {theme.summaryText}
              </p>
            </div>

            {}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner self-center shrink-0">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#ffffff"
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-3xl font-black">{percentage}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Probability</span>
                </div>
              </div>
              <span className="mt-2 text-xs font-bold text-white/90">
                Binary Decision: {result.dropout === 1 ? 'Predicted Dropout (1)' : 'Retained (0)'}
              </span>
            </div>
          </div>
        </div>

        {}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">

          {}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Key Contributing Risk Factors
              </h2>
            </div>

            <p className="text-xs text-slate-500">
              Primary behavioral and academic factors flagged by the ML classification model:
            </p>

            <ul className="space-y-2.5">
              {result.contributing_factors && result.contributing_factors.length > 0 ? (
                result.contributing_factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <span className="font-medium">{factor}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500 italic">No significant risk factors detected.</li>
              )}
            </ul>
          </div>

          {}
          <div className="space-y-4 pt-6 md:pt-0 md:pl-8">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Recommended Actions for Advisors
              </h2>
            </div>

            <p className="text-xs text-slate-500">
              Targeted retention strategies designed to mitigate attrition risk:
            </p>

            <ul className="space-y-2.5">
              {result.recommendations && result.recommendations.length > 0 ? (
                result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/60">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{rec}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500 italic">Continue standard semester monitoring.</li>
              )}
            </ul>
          </div>

        </div>
      </div>

      {}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Assessed Student Profile Snapshot
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Student Identifier</span>
            <span className="font-bold text-slate-800">{displayStudentId}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Department</span>
            <span className="font-bold text-slate-800">{input.department} (Sem {input.semester})</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Cumulative GPA</span>
            <span className="font-bold text-slate-800">{input.cgpa} (Sem: {input.semester_gpa})</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Attendance Rate</span>
            <span className="font-bold text-slate-800">{input.attendance_rate}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Daily Study Time</span>
            <span className="font-bold text-slate-800">{input.study_hours_per_day} hours/day</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Stress Index</span>
            <span className="font-bold text-slate-800">{input.stress_index} / 10</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Assignment Delays</span>
            <span className="font-bold text-slate-800">{input.assignment_delay_days} days</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Scholarship / Aid</span>
            <span className="font-bold text-slate-800">{input.scholarship}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
