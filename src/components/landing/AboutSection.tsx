import React from 'react';
import { GraduationCap, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 relative border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Our Mission</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 mb-6">
              Transforming Academic Guidance Through Human Expertise & AI Intelligence
            </h2>
            <p className="text-slate-300 text-base leading-relaxed mb-6">
              EduMentorX was built to solve a critical institutional challenge: fragmented mentorship records, delayed academic risk detection, and lack of 24/7 personal student guidance.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              By combining permanent historical mentorship logs, explainable risk indicators, and a confidential AI safety escalation framework, EduMentorX guarantees that no student falls through the cracks.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">100% Student-Centric</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Confidential Safety</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <HeartHandshake className="w-5 h-5 text-purple-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Permanent Records</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <Award className="w-5 h-5 text-sky-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Production SaaS Grade</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 rounded-3xl blur-2xl"></div>
            <div className="relative p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xl">
                  EX
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">EduMentorX Platform Architecture</h4>
                  <p className="text-xs text-slate-400">Institutional Governance & AI Safety Standards</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800 font-mono">
                "System architecture enforces strict role separation between Admin, Mentor, and Student. Confidential AI safety logs are isolated from student views, and risk classifications are fully transparent."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
