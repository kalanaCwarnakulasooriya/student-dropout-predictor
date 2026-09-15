import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Users, AlertTriangle, ShieldAlert, ShieldCheck,
  Zap, Search, Filter, ArrowRight, RefreshCw, GraduationCap, Sparkles, Loader2
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { RiskBadge } from '../components/ui/RiskBadge';
import { getStats, getStoredPredictions, clearPredictionHistory } from '../services/storageService';
import { fetchPredictionHistory } from '../services/predictionService';
import { PredictionRecord } from '../types/student';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(getStats());
  const [records, setRecords] = useState<PredictionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('All');
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historySource, setHistorySource] = useState<'backend' | 'local' | null>(null);

  const refreshData = async () => {
    setHistoryLoading(true);
    try {
      setStats(getStats());
      const backendRecords = await fetchPredictionHistory();
      if (backendRecords !== null) {
        setRecords(backendRecords);
        setHistorySource('backend');
      } else {
        setRecords(getStoredPredictions());
        setHistorySource('local');
      }
    } finally {
      setHistoryLoading(false);
    }
  };


  useEffect(() => { refreshData(); }, [location.key]);

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.input.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'All' || rec.result.risk_level === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const highPercent = Math.round((stats.highRisk / stats.total) * 100) || 14;
  const medPercent  = Math.round((stats.mediumRisk / stats.total) * 100) || 26;
  const lowPercent  = 100 - highPercent - medPercent;

  return (
    <div className="space-y-6">


      <div className="hero-mesh relative rounded-3xl p-7 sm:p-10 overflow-hidden border border-indigo-500/20 shadow-2xl shadow-indigo-900/30">

        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-purple-600/20 blur-3xl pointer-events-none animate-float" />
        <div className="absolute right-32 bottom-0 w-48 h-48 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-indigo-200 border border-white/10">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Advisor &amp; Faculty Early Warning Console</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Student Dropout<br />
              <span className="gradient-text">Risk Intelligence</span>
            </h1>
            <p className="text-sm text-indigo-200/80 leading-relaxed max-w-lg">
              Harness machine learning classification to detect at-risk undergraduate students early.
              Analyze academic standing, behavioral attendance patterns, and socioeconomic triggers.
            </p>
          </div>

          <div className="flex flex-col gap-3 flex-shrink-0">
            <Link
              to="/predict"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-indigo-700 font-bold text-sm shadow-xl hover:bg-indigo-50 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4" />
              Make New Prediction
            </Link>
            <div className="flex items-center justify-center gap-3 text-xs text-indigo-300">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {stats.total} Analyzed
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> {stats.highRisk} High Risk
              </span>
            </div>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Predictions" value={stats.total}
          subtitle="Cumulative students assessed"
          icon={<Users className="w-6 h-6" />} accentColor="indigo"
          trend="All-time records" />
        <StatCard title="High Risk Students" value={stats.highRisk}
          subtitle="Urgent intervention required"
          icon={<ShieldAlert className="w-6 h-6" />} accentColor="rose"
          trend="Probability ≥ 70%" />
        <StatCard title="Medium Risk Students" value={stats.mediumRisk}
          subtitle="Proactive monitoring suggested"
          icon={<AlertTriangle className="w-6 h-6" />} accentColor="amber"
          trend="Probability 40–69%" />
        <StatCard title="Low Risk Students" value={stats.lowRisk}
          subtitle="Satisfactory progression"
          icon={<ShieldCheck className="w-6 h-6" />} accentColor="emerald"
          trend="Probability < 40%" />
      </div>


      <div className="section-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Student Risk Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Overall risk profile of analyzed cohort</p>
          </div>
          <div className="flex items-center gap-5 text-xs font-semibold">
            <span className="flex items-center gap-2 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High ({highPercent}%)
            </span>
            <span className="flex items-center gap-2 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium ({medPercent}%)
            </span>
            <span className="flex items-center gap-2 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low ({lowPercent}%)
            </span>
          </div>
        </div>


        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5 shadow-inner">
          <div style={{ width: `${highPercent}%` }}
            className="h-full bg-gradient-to-r from-rose-600 to-rose-500 transition-all duration-700 rounded-l-full"
            title={`High Risk: ${highPercent}%`} />
          <div style={{ width: `${medPercent}%` }}
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
            title={`Medium Risk: ${medPercent}%`} />
          <div style={{ width: `${lowPercent}%` }}
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-700 rounded-r-full"
            title={`Low Risk: ${lowPercent}%`} />
        </div>


        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'High Risk', pct: highPercent, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
            { label: 'Medium Risk', pct: medPercent, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'Low Risk', pct: lowPercent, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          ].map(seg => (
            <div key={seg.label} className={`p-3 rounded-xl border ${seg.bg} text-center`}>
              <div className={`text-2xl font-black ${seg.color}`}>{seg.pct}%</div>
              <div className="text-xs text-slate-500 mt-0.5">{seg.label}</div>
            </div>
          ))}
        </div>
      </div>


      <div className="section-card overflow-hidden">

        <div className="p-5 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Recent Predictions</h2>
              {historySource === 'backend' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Live API
                </span>
              )}
              {historySource === 'local' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  Offline (Local)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Student evaluation records &amp; predicted dropout probabilities</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID or Dept…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dark-input pl-8 w-40 sm:w-48"
              />
            </div>


            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="dark-input pr-6 appearance-none cursor-pointer"
              style={{ backgroundImage: 'none' }}
            >
              <option value="All">All Risks</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>

            <button
              onClick={() => { if (confirm('Reset history?')) { clearPredictionHistory(); refreshData(); } }}
              title="Reset Records"
              className="p-2 text-slate-500 hover:text-indigo-400 rounded-xl hover:bg-indigo-500/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading history from backend…</span>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-white/5 text-slate-500 uppercase font-bold text-[11px] tracking-widest">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Student ID</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">GPA / Attend.</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Probability</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right sm:pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-600">
                      <Sparkles className="w-8 h-8" />
                      <p className="font-semibold text-sm">No matching predictions found</p>
                      <Link to="/predict" className="text-xs text-indigo-400 hover:underline">
                        Make your first prediction →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const prob = Math.round(
                    rec.result.probability > 1 ? rec.result.probability : rec.result.probability * 100
                  );
                  const probColor =
                    rec.result.risk_level === 'High' ? 'text-rose-400' :
                    rec.result.risk_level === 'Medium' ? 'text-amber-400' :
                    'text-emerald-400';

                  return (
                    <tr
                      key={rec.id}
                      className="table-row-hover transition-colors cursor-pointer group"
                      onClick={() => navigate('/result', { state: { result: rec.result, input: rec.input } })}
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-mono text-xs font-bold">
                            {rec.studentId.slice(-2)}
                          </span>
                          <span className="font-bold text-slate-200">{rec.studentId}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-700/60 text-slate-300 text-xs font-medium border border-white/5">
                          {rec.input.department}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-200">GPA: {rec.input.gpa}</div>
                        <div className="text-[11px] text-slate-500">Att: {rec.input.attendance_rate}%</div>
                      </td>
                      <td className="py-4 px-4">
                        <RiskBadge level={rec.result.risk_level} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-lg font-black ${probColor}`}>{prob}%</span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-xs">
                        {new Date(rec.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4 px-4 text-right sm:pr-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/result', { state: { result: rec.result, input: rec.input } });
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform"
                        >
                          Inspect <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};
