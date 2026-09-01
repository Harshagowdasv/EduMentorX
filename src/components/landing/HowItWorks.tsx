import React from 'react';
import { UserPlus, UserCheck, Activity, MessageSquare, Bot, ShieldAlert } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: <UserPlus className="w-5 h-5 text-indigo-400" />,
    title: 'Admin Onboards Mentors & Students',
    description: 'Bulk import students via CSV or create mentor/student records manually with automated role initialization.',
  },
  {
    step: '02',
    icon: <UserCheck className="w-5 h-5 text-purple-400" />,
    title: 'Smart Allocation System',
    description: 'Assign students to faculty mentors with zero risk of history loss during future department transfers.',
  },
  {
    step: '03',
    icon: <Activity className="w-5 h-5 text-emerald-400" />,
    title: 'Real-Time Performance Tracking',
    description: 'System automatically calculates transparent risk indicators based on CGPA, attendance, backlogs, and study hours.',
  },
  {
    step: '04',
    icon: <MessageSquare className="w-5 h-5 text-sky-400" />,
    title: 'Continuous Student-Mentor Dialogue',
    description: 'Mentors assign courses, log meeting notes, share resources, and keep structured interaction logs.',
  },
  {
    step: '05',
    icon: <Bot className="w-5 h-5 text-purple-400" />,
    title: 'AI Animated Assistant Support',
    description: 'Students interact with an AI voice avatar for 24/7 study planning, project guidance, and career prep.',
  },
  {
    step: '06',
    icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
    title: 'Contextual Safety Escalation',
    description: 'High-risk emotional situations are confidentially flagged to faculty mentors with immutable audit logs.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 relative border-b border-slate-800/60 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Seamless Institutional Workflow</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">How EduMentorX Operates</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800/70 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black text-indigo-500/40 font-mono">{s.step}</span>
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50">{s.icon}</div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
