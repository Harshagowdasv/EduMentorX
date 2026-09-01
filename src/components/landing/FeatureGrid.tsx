import React from 'react';
import { UserCheck, LineChart, Bot, History, AlertTriangle, BarChart3, FolderGit2, Briefcase } from 'lucide-react';

const features = [
  {
    icon: <UserCheck className="w-6 h-6 text-indigo-400" />,
    title: 'Smart Mentor Allocation',
    description: 'Automated allocation matching students with mentors based on department, workload, and bulk CSV uploads.',
  },
  {
    icon: <LineChart className="w-6 h-6 text-emerald-400" />,
    title: 'Explainable Performance Tracking',
    description: 'Transparent risk status (Good, Needs Monitoring, High Priority) with clear contributing factor breakdowns.',
  },
  {
    icon: <Bot className="w-6 h-6 text-purple-400" />,
    title: 'AI Animated Voice Mentor',
    description: 'Interactive animated avatar assistant supporting custom voice, text chat, speech recognition, and guidance.',
  },
  {
    icon: <History className="w-6 h-6 text-sky-400" />,
    title: 'Permanent Mentorship Logs',
    description: 'Complete chronological history preserved across mentor reallocations so student records are never lost.',
  },
  {
    icon: <AlertTriangle className="w-6 h-6 text-rose-400" />,
    title: 'Contextual AI Safety Engine',
    description: 'Evaluates emotional intent to trigger confidential safety escalation for genuine distress without false alarms.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-amber-400" />,
    title: 'Institutional Analytics',
    description: 'Visual department breakdowns, CGPA distributions, risk spread, and exportable CSV administrative reports.',
  },
  {
    icon: <FolderGit2 className="w-6 h-6 text-indigo-400" />,
    title: 'Resource & Course Sharing',
    description: 'Mentors assign courses, activities, and syllabus notes directly into the student timeline.',
  },
  {
    icon: <Briefcase className="w-6 h-6 text-purple-400" />,
    title: 'Student Career Portfolio',
    description: 'Build extracurriculars, certificates, GitHub projects, and coding handles with a live profile completeness score.',
  },
];

export const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="py-20 relative border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Institutional Capabilities</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for Modern Universities and EdTech Leadership
          </p>
          <p className="mt-4 text-slate-400 text-base">
            EduMentorX delivers a complete end-to-end digital ecosystem for student guidance and academic safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all group duration-300 backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
