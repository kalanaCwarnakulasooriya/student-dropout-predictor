import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor: 'indigo' | 'rose' | 'amber' | 'emerald';
  trend?: string;
}

const SCHEMES = {
  indigo: {
    card: 'stat-indigo glow-indigo',
    icon: 'bg-indigo-500/20 text-indigo-400',
    value: 'text-indigo-200',
    title: 'text-indigo-300',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
    bar: 'bg-indigo-500',
  },
  rose: {
    card: 'stat-rose glow-rose',
    icon: 'bg-rose-500/20 text-rose-400',
    value: 'text-rose-200',
    title: 'text-rose-300',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
    bar: 'bg-rose-500',
  },
  amber: {
    card: 'stat-amber glow-amber',
    icon: 'bg-amber-500/20 text-amber-400',
    value: 'text-amber-200',
    title: 'text-amber-300',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    bar: 'bg-amber-500',
  },
  emerald: {
    card: 'stat-emerald glow-emerald',
    icon: 'bg-emerald-500/20 text-emerald-400',
    value: 'text-emerald-200',
    title: 'text-emerald-300',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    bar: 'bg-emerald-500',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon, accentColor, trend,
}) => {
  const s = SCHEMES[accentColor];

  return (
    <div className={`card-hover p-5 rounded-2xl ${s.card} relative overflow-hidden`}>

      <div className="shimmer absolute inset-0 pointer-events-none rounded-2xl" />

      <div className="relative flex items-start justify-between mb-3">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${s.title}`}>
            {title}
          </p>
          <h3 className={`text-4xl font-black tracking-tight ${s.value}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${s.icon} flex-shrink-0`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${s.badge}`}>
          {trend}
        </div>
      )}
    </div>
  );
};

