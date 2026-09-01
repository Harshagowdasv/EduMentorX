import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileCompletenessGaugeProps {
  completeness: number;
  suggestions: string[];
}

export const ProfileCompletenessGauge: React.FC<ProfileCompletenessGaugeProps> = ({
  completeness,
  suggestions,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Career Profile Completeness
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Higher completion increases faculty mentor visibility</p>
        </div>
        <span className="text-2xl font-black text-indigo-400 font-mono">{completeness}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-400 transition-all duration-500"
          style={{ width: `${completeness}%` }}
        />
      </div>

      {/* Missing Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-2">
          <p className="font-bold text-slate-300 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Actionable Profile Improvement Tips:
          </p>
          <ul className="space-y-1 text-slate-400 pl-5 list-disc">
            {suggestions.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
