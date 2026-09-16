import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  AlertCircle,
  Loader2,
  BookOpen,
  Clock,
  Wallet,
  User,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  BrainCircuit,
  Info
} from 'lucide-react';
import { StudentInputData, FormValidationErrors } from '../types/student';
import { predictStudentDropout } from '../services/predictionService';
import { savePredictionRecord } from '../services/storageService';

const INITIAL_FORM_STATE: StudentInputData = {
  student_id: '',
  age: 20,
  gender: 'Male',
  family_income: 50000,
  internet_access: 'Yes',
  study_hours_per_day: 3.5,
  attendance_rate: 80,
  assignment_delay_days: 1,
  travel_time_minutes: 30,
  part_time_job: 'No',
  scholarship: 'No',
  stress_index: 4,
  gpa: 3.1,
  semester_gpa: 3.0,
  cgpa: 3.05,
  semester: 3,
  department: 'Computing',
  parental_education: 'Secondary',
  failures: 0,
};

export const PredictPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StudentInputData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);


  const validateField = (name: keyof StudentInputData, value: any): string | undefined => {
    switch (name) {
      case 'age':
        if (value === '' || isNaN(value)) return 'Age is required.';
        if (value < 16 || value > 80) return 'Age must be between 16 and 80.';
        return undefined;
      case 'attendance_rate':
        if (value === '' || isNaN(value)) return 'Attendance rate is required.';
        if (value < 0 || value > 100) return 'Attendance rate must be between 0% and 100%.';
        return undefined;
      case 'gpa':
      case 'semester_gpa':
      case 'cgpa':
        if (value === '' || isNaN(value)) return 'GPA value is required.';
        if (value < 0.0 || value > 4.0) return 'GPA must be between 0.00 and 4.00.';
        return undefined;
      case 'study_hours_per_day':
        if (value === '' || isNaN(value)) return 'Study hours are required.';
        if (value < 0 || value > 24) return 'Study hours must be between 0 and 24.';
        return undefined;
      case 'stress_index':
        if (value === '' || isNaN(value)) return 'Stress index is required.';
        if (value < 1 || value > 10) return 'Stress index must be between 1 and 10.';
        return undefined;
      case 'assignment_delay_days':
        if (value === '' || isNaN(value)) return 'Delay days required.';
        if (value < 0) return 'Delay days cannot be negative.';
        return undefined;
      case 'travel_time_minutes':
        if (value === '' || isNaN(value)) return 'Travel time required.';
        if (value < 0) return 'Travel time cannot be negative.';
        return undefined;
      case 'family_income':
        if (value === '' || isNaN(value)) return 'Income required.';
        if (value < 0) return 'Income cannot be negative.';
        return undefined;
      case 'failures':
        if (value === '' || isNaN(value)) return 'Number of failures required.';
        if (value < 0) return 'Cannot be negative.';
        if (value > 20) return 'Value seems too high (max 20).';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (name: keyof StudentInputData, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const validateAll = (): boolean => {
    const newErrors: FormValidationErrors = {};
    (Object.keys(formData) as (keyof StudentInputData)[]).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const loadPreset = (type: 'high' | 'med' | 'low') => {
    setErrors({});
    setApiError(null);
    if (type === 'high') {
      setFormData({
        student_id: 'ST-2024-DEMO-HIGH',
        age: 22,
        gender: 'Male',
        family_income: 28000,
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
        semester: 4,
        department: 'Computing',
        parental_education: 'Secondary',
        failures: 2,
      });
    } else if (type === 'med') {
      setFormData({
        student_id: 'ST-2024-DEMO-MED',
        age: 21,
        gender: 'Female',
        family_income: 62000,
        internet_access: 'Yes',
        study_hours_per_day: 3.0,
        attendance_rate: 73,
        assignment_delay_days: 2,
        travel_time_minutes: 40,
        part_time_job: 'Yes',
        scholarship: 'No',
        stress_index: 6,
        gpa: 2.65,
        semester_gpa: 2.5,
        cgpa: 2.6,
        semester: 3,
        department: 'Business',
        parental_education: 'Diploma',
        failures: 1,
      });
    } else {
      setFormData({
        student_id: 'ST-2024-DEMO-LOW',
        age: 20,
        gender: 'Female',
        family_income: 98000,
        internet_access: 'Yes',
        study_hours_per_day: 5.5,
        attendance_rate: 96,
        assignment_delay_days: 0,
        travel_time_minutes: 15,
        part_time_job: 'No',
        scholarship: 'Yes',
        stress_index: 2,
        gpa: 3.85,
        semester_gpa: 3.9,
        cgpa: 3.88,
        semester: 2,
        department: 'Engineering',
        parental_education: 'Degree',
        failures: 0,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const result = await predictStudentDropout(formData);
      savePredictionRecord(formData, result);

      navigate('/result', { state: { result, input: formData } });
    } catch (err: any) {
      setApiError('Unable to process prediction. Please verify input data and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Student Risk Assessment Form
            </h1>
            <p className="text-sm text-slate-500">
              Input academic parameters, behavioral engagement metrics, and demographic details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFormData(INITIAL_FORM_STATE);
              setErrors({});
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Form</span>
          </button>
        </div>

        {}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Load Quick Demo Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadPreset('high')}
              className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold transition-colors"
            >
              🔴 High Risk Preset
            </button>
            <button
              type="button"
              onClick={() => loadPreset('med')}
              className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold transition-colors"
            >
              🟡 Medium Risk Preset
            </button>
            <button
              type="button"
              onClick={() => loadPreset('low')}
              className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors"
            >
              🟢 Low Risk Preset
            </button>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Prediction Error</p>
            <p>{apiError}</p>
          </div>
        </div>
      )}

      {}
      <form onSubmit={handleSubmit} className="space-y-6 predict-section">

        {}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Academic Standing & Department</h2>
              <p className="text-xs text-slate-500">Grade points and enrolled academic course</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Student ID <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. ST-2024-042"
                value={formData.student_id || ''}
                onChange={(e) => handleChange('student_id', e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Department / Faculty <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Computing">Computing & IT</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business Management</option>
                <option value="Science">Applied Science</option>
                <option value="Humanities">Humanities & Social Sciences</option>
                <option value="Medicine">Medicine & Health Sciences</option>
              </select>
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Current Semester (1 - 8) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.semester}
                onChange={(e) => handleChange('semester', Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Overall CGPA (0.00 – 4.00) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.cgpa}
                onChange={(e) => handleChange('cgpa', parseFloat(e.target.value))}
                className={`w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border ${
                  errors.cgpa ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.cgpa && (
                <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.cgpa}
                </p>
              )}
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Latest Semester GPA (0.00 – 4.00) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.semester_gpa}
                onChange={(e) => handleChange('semester_gpa', parseFloat(e.target.value))}
                className={`w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border ${
                  errors.semester_gpa ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.semester_gpa && (
                <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.semester_gpa}
                </p>
              )}
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Admission / Baseline GPA <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.gpa}
                onChange={(e) => handleChange('gpa', parseFloat(e.target.value))}
                className={`w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border ${
                  errors.gpa ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.gpa && (
                <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.gpa}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Failed Courses <span className="text-rose-500">*</span>
                <span className="ml-1 font-normal text-slate-400">(this semester)</span>
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={formData.failures}
                onChange={(e) => handleChange('failures', Number(e.target.value))}
                className={`w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border ${
                  errors.failures ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.failures && (
                <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.failures}
                </p>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Attendance & Study Habits</h2>
              <p className="text-xs text-slate-500">Classroom presence and academic time commitment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Attendance Rate (%) <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-semibold text-slate-500">{formData.attendance_rate}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.attendance_rate}
                onChange={(e) => handleChange('attendance_rate', Number(e.target.value))}
                className={`w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border ${
                  errors.attendance_rate ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.attendance_rate && (
                <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.attendance_rate}
                </p>
              )}
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Study Hours / Day <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={formData.study_hours_per_day}
                onChange={(e) => handleChange('study_hours_per_day', parseFloat(e.target.value))}
                className={`w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border ${
                  errors.study_hours_per_day ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.study_hours_per_day && (
                <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.study_hours_per_day}
                </p>
              )}
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assignment Delay (Days) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.assignment_delay_days}
                onChange={(e) => handleChange('assignment_delay_days', Number(e.target.value))}
                className={`w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border ${
                  errors.assignment_delay_days ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.assignment_delay_days && (
                <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.assignment_delay_days}
                </p>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Personal & Socioeconomic Background</h2>
              <p className="text-xs text-slate-500">Demographic factors, household support, and stress indicators</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="16"
                max="80"
                value={formData.age}
                onChange={(e) => handleChange('age', Number(e.target.value))}
                className={`w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border ${
                  errors.age ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.age && (
                <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.age}
                </p>
              )}
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Parental Education Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.parental_education}
                onChange={(e) => handleChange('parental_education', e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Primary">Primary Education</option>
                <option value="Secondary">Secondary / High School</option>
                <option value="Diploma">Diploma / Vocational</option>
                <option value="Degree">Undergraduate Degree</option>
                <option value="Postgraduate">Postgraduate / Masters / PhD</option>
              </select>
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Monthly Family Income (LKR / Currency) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={formData.family_income}
                onChange={(e) => handleChange('family_income', Number(e.target.value))}
                className={`w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border ${
                  errors.family_income ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.family_income && (
                <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.family_income}
                </p>
              )}
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Daily Commute / Travel Time (Mins) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.travel_time_minutes}
                onChange={(e) => handleChange('travel_time_minutes', Number(e.target.value))}
                className={`w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border ${
                  errors.travel_time_minutes ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.travel_time_minutes && (
                <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.travel_time_minutes}
                </p>
              )}
            </div>

            {}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Stress Index (1 - 10) <span className="text-rose-500">*</span>
                </label>
                <span className={`text-xs font-bold ${
                  formData.stress_index >= 8 ? 'text-rose-600' :
                  formData.stress_index >= 5 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {formData.stress_index} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.stress_index}
                onChange={(e) => handleChange('stress_index', Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              {errors.stress_index && (
                <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.stress_index}
                </p>
              )}
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Has Part-Time Employment? <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.part_time_job}
                onChange={(e) => handleChange('part_time_job', e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Holds Academic Scholarship? <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.scholarship}
                onChange={(e) => handleChange('scholarship', e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Reliable Home Internet? <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.internet_access}
                onChange={(e) => handleChange('internet_access', e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Form inputs are strictly validated before ML inference.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-md hover:shadow-indigo-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Machine Learning Model...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" />
                <span>Predict Dropout Risk</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
