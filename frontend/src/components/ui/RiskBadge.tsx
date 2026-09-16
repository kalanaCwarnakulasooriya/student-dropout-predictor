import React from 'react';
import { RiskLevel } from '../../types/student';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true
}) => {
  const getStyles = () => {
    switch (level) {
      case 'High':
        return {
          container: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          dot: 'bg-rose-500',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
        };
      case 'Medium':
        return {
          container: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-500',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'Low':
      default:
        return {
          container: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':  return 'px-2 py-0.5 text-xs font-semibold';
      case 'lg':  return 'px-4 py-1.5 text-sm font-bold tracking-wide';
      case 'md':
      default:    return 'px-2.5 py-1 text-xs font-semibold';
    }
  };

  const style = getStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${style.container} ${getSizeClasses()}`}
    >
      {showIcon && style.icon}
      <span className={`rounded-full ${style.dot} ${size === 'lg' ? 'w-2 h-2' : 'w-1.5 h-1.5'}`} />
      <span>{level} Risk</span>
    </span>
  );
};
