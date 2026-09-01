import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-slate-800/60 rounded-xl w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-800/40 rounded-2xl border border-slate-800"></div>
        ))}
      </div>
      <div className="space-y-3 pt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-800/30 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
};
