import React from 'react';
import { Calendar, CheckSquare, FileText, BookOpen, Share2, ShieldAlert } from 'lucide-react';

interface MentorActionCenterProps {
  onNavigate: (section: string) => void;
}

export const MentorActionCenter: React.FC<MentorActionCenterProps> = ({ onNavigate }) => {
  const actions = [
    { label: 'Schedule Meeting', section: 'meetings', icon: Calendar, color: 'bg-indigo-600' },
    { label: 'Create Follow-up', section: 'tasks', icon: CheckSquare, color: 'bg-purple-600' },
    { label: 'Intervention Center', section: 'intervention-center', icon: ShieldAlert, color: 'bg-rose-600' },
    { label: 'Share Resource', section: 'resources', icon: BookOpen, color: 'bg-emerald-600' },
  ];

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Mentor Quick-Action Workspace Panel</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigate(act.section)}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all flex items-center gap-2.5 group"
            >
              <div className={`p-2 rounded-lg ${act.color} text-white shrink-0 shadow-md`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
