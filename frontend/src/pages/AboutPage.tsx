import React from 'react';
import {
  BrainCircuit,
  Layers,
  Code,
  Users,
  CheckCircle2,
  Database,
  Cpu,
  GitBranch,
  FileSpreadsheet,
  Award
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
          <Award className="w-3.5 h-3.5" />
          <span>ITS-2140 Machine Learning Project</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          System Architecture & Model Specifications
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Comprehensive documentation of the Machine Learning pipeline, feature engineering strategies,
          model comparison metrics, and full-stack integration design.
        </p>
      </div>

      {}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">1. Problem Formulation</h2>
            <p className="text-xs text-slate-500">Binary Supervised Classification</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Early university student departure causes severe educational and institutional losses.
          This system models student retention as a supervised binary classification task:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Target Variable</span>
            <code className="text-indigo-700 font-mono">Dropout (1) / Non-Dropout (0)</code>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Evaluation Primary Metric</span>
            <span className="text-slate-700 font-semibold">F1-Score & Recall (Minimizing False Negatives)</span>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">2. Feature Engineering Strategies</h2>
            <p className="text-xs text-slate-500">Domain-tailored transformation techniques applied during preprocessing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              1. GPA & CGPA Binning
            </div>
            <p className="text-slate-600">
              Low (<span className="font-mono text-indigo-600">&lt; 2.0</span>),
              Medium (<span className="font-mono text-indigo-600">2.0 – 3.0</span>),
              High (<span className="font-mono text-indigo-600">&gt; 3.0</span>). Captures non-linear probation thresholds.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              2. Attendance Categorization
            </div>
            <p className="text-slate-600">
              Poor (&lt; 60%), Average (60% – 80%), Good (&gt; 80%) based on university minimum attendance criteria.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              3. Composite Academic Engagement Score
            </div>
            <p className="text-slate-600">
              Synthesized composite metric: <br />
              <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">
                Engagement = (Attendance% + StudyHours×10 + OnTimeSubmission%) / 3
              </code>
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              4. Parental Education Encoding
            </div>
            <p className="text-slate-600">
              Ordinal hierarchy ranking: Primary (1) → Secondary (2) → Diploma (3) → Degree (4) → Postgraduate (5).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              5. Financial Stress Vulnerability Flag
            </div>
            <p className="text-slate-600">
              Binary indicator derived from low household income thresholds paired with lack of scholarships.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              6. Cross-Feature Interaction Terms
            </div>
            <p className="text-slate-600">
              Captures compound risks: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">GPA × Attendance</code> and <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">StudyHours × StressIndex</code>.
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">3. Machine Learning Algorithms Evaluated</h2>
            <p className="text-xs text-slate-500">Comparative assessment across classification benchmarks</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Key Strengths</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="bg-indigo-50/50">
                <td className="py-2.5 px-3 font-bold text-indigo-900">Logistic Regression</td>
                <td className="py-2.5 px-3 font-semibold text-indigo-700">Production Champion</td>
                <td className="py-2.5 px-3">High interpretability, fast inference, and strong generalisation on tabular data</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Deployed (Active)
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Decision Tree</td>
                <td className="py-2.5 px-3">Interpretable Tree</td>
                <td className="py-2.5 px-3">Direct rule extraction for academic counseling</td>
                <td className="py-2.5 px-3 text-right text-slate-500">Benchmarked</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Random Forest</td>
                <td className="py-2.5 px-3">Ensemble Bagging</td>
                <td className="py-2.5 px-3">Robust against overfitting, feature importance ranking</td>
                <td className="py-2.5 px-3 text-right text-slate-500">Benchmarked</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">XGBoost / Gradient Boost</td>
                <td className="py-2.5 px-3">Ensemble Boosting</td>
                <td className="py-2.5 px-3">Highest ROC-AUC score and superior handling of feature interactions</td>
                <td className="py-2.5 px-3 text-right text-slate-500">Benchmarked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">4. Project Team Division (3 Members)</h2>
            <p className="text-xs text-slate-500">Responsibilities per course assignment specification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="font-bold text-slate-900 block">Member 1 — ML Engineer</span>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              <li>Dataset collection & EDA</li>
              <li>Data cleaning & feature engineering</li>
              <li>Model training & hyperparameter tuning</li>
              <li>Model export (.pkl / joblib)</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="font-bold text-slate-900 block">Member 2 — Backend & Integration</span>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              <li>FastAPI / Flask REST endpoints</li>
              <li>Input validation schemas (Pydantic)</li>
              <li>Model loading & inference pipeline</li>
              <li>Cross-Origin Resource Sharing (CORS)</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
            <span className="font-bold text-indigo-900 block">Member 3 — Frontend UI (You)</span>
            <ul className="space-y-1 text-slate-700 list-disc list-inside font-medium">
              <li>React + TypeScript dashboard</li>
              <li>3-tier validated student entry form</li>
              <li>Real-time probability gauge & risk indicators</li>
              <li>Offline simulation engine & report export</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
