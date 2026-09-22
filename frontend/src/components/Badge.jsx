import React from 'react';
import { Trophy, Medal, Award, Star } from 'lucide-react';

const Badge = ({ type, size = 'md', className = '', showIcon = true }) => {
  const getBadgeStyles = () => {
    const baseStyles = 'badge-shine inline-flex items-center justify-center font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 select-none relative overflow-hidden';

    const sizeStyles = {
      xs: 'px-2 py-0.5 text-[8px] gap-1',
      sm: 'px-3 py-1.5 text-[9px] gap-1.5',
      md: 'px-4 py-2 text-xs gap-2',
      lg: 'px-6 py-3 text-sm gap-3'
    };

    const colorStyles = {
      Gold: 'bg-gradient-to-br from-amber-100 via-yellow-300 to-amber-500 text-amber-900 shadow-[0_4px_20px_rgba(251,191,36,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] border border-amber-300/60',
      Silver: 'bg-gradient-to-br from-slate-50 via-slate-200 to-slate-400 text-slate-800 shadow-[0_4px_20px_rgba(148,163,184,0.3),inset_0_1px_0_rgba(255,255,255,0.8)] border border-slate-200/60',
      Bronze: 'bg-gradient-to-br from-orange-100 via-orange-300 to-rose-500 text-orange-900 shadow-[0_4px_20px_rgba(249,115,22,0.3),inset_0_1px_0_rgba(255,255,255,0.5)] border border-orange-300/60'
    };

    return `${baseStyles} ${sizeStyles[size]} ${colorStyles[type] || 'bg-slate-100 text-slate-500 border border-slate-200'} ${className}`;
  };

  const getBadgeIcon = () => {
    const iconSize = size === 'xs' ? 10 : size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    
    switch (type) {
      case 'Gold':
        return <Trophy size={iconSize} className="drop-shadow-sm" />;
      case 'Silver':
        return <Medal size={iconSize} className="drop-shadow-sm" />;
      case 'Bronze':
        return <Award size={iconSize} className="drop-shadow-sm" />;
      default:
        return <Star size={iconSize} />;
    }
  };

  if (!type) return null;

  return (
    <span className={getBadgeStyles()}>
      {showIcon && <span className="relative z-10">{getBadgeIcon()}</span>}
      <span className="relative z-10 leading-none">{type}</span>
    </span>
  );
};

export default Badge;
