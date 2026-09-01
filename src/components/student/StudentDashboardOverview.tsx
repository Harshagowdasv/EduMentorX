import React from 'react';
import { Student } from '../../types';
import { TrendingUp, GraduationCap, Clock, AlertTriangle, UserCheck, Mail, Phone } from 'lucide-react';

interface StudentDashboardOverviewProps {
  student: Student;
  onOpenAIMentor: () => void;
}

export const StudentDashboardOverview: React.FC<StudentDashboardOverviewProps> = ({
  student,
  onOpenAIMentor,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Academic Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/50">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Cumulative CGPA</p>
            <p className="text-2xl font-bold text-white mt-1">{student.cgpa.toFixed(2)}</p>
            <span className="text-[11px] text-indigo-400 font-semibold">Scale 0 - 10.0</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/50">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Lecture Attendance</p>
            <p className="text-2xl font-bold text-white mt-1">{student.attendance}%</p>
            <span className={`text-[11px] font-semibold ${student.attendance >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {student.attendance >= 75 ? 'Meets requirement' : 'Below 75%'}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/50">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Weekly Study Hours</p>
            <p className="text-2xl font-bold text-white mt-1">{student.studyHours} hrs</p>
            <span className="text-[11px] text-purple-300 font-semibold">Self-reported Discipline</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/50">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Active Backlogs</p>
            <p className="text-2xl font-bold text-white mt-1">{student.previousYearBacklogs}</p>
            <span className="text-[11px] text-slate-400">Previous semesters</span>
          </div>
        </div>
      </div>

      {/* Main Mentor Card & AI Promo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mentor Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Your Faculty Mentor</h3>
          {student.mentorId ? (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-bold text-lg">
                {student.mentorName?.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{student.mentorName}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" /> {student.mentorEmail}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-400">You are currently awaiting faculty mentor allocation.</p>
          )}
        </div>

        {/* AI Assistant Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-800/50 flex flex-col justify-between space-y-4">
          <div>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-900/60 text-indigo-300 rounded-full border border-indigo-700">
              AI Voice Mentor Active
            </span>
            <h3 className="text-lg font-bold text-white mt-2">Need Instant Academic Guidance?</h3>
            <p className="text-xs text-slate-300 mt-1">
              Chat or speak with your 2D Animated AI Avatar Assistant for study schedules, project code ideas, and career prep.
            </p>
          </div>
          <button
            onClick={onOpenAIMentor}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all text-center"
          >
            Launch AI Avatar Mentor
          </button>
        </div>
      </div>
    </div>
  );
};
