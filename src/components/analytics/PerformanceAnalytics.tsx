import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, Calendar, Filter, Award, Clock } from 'lucide-react';

interface PerformanceAnalyticsProps {
  studentName?: string;
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ studentName }) => {
  const [timeRange, setTimeRange] = useState<'30d' | '3m' | '6m' | '1y' | 'all'>('6m');

  const getTrendData = () => {
    if (timeRange === '30d') {
      return [
        { period: 'Week 1', cgpa: 8.6, attendance: 90, studyHours: 14, backlogs: 0 },
        { period: 'Week 2', cgpa: 8.65, attendance: 92, studyHours: 15, backlogs: 0 },
        { period: 'Week 3', cgpa: 8.75, attendance: 91, studyHours: 16, backlogs: 0 },
        { period: 'Week 4', cgpa: 8.85, attendance: 92, studyHours: 16, backlogs: 0 },
      ];
    }
    if (timeRange === '3m') {
      return [
        { period: 'Month 1', cgpa: 8.2, attendance: 88, studyHours: 12, backlogs: 1 },
        { period: 'Month 2', cgpa: 8.5, attendance: 90, studyHours: 14, backlogs: 0 },
        { period: 'Month 3', cgpa: 8.85, attendance: 92, studyHours: 16, backlogs: 0 },
      ];
    }
    // 6m / 1y / all default
    return [
      { period: 'Semester 1', cgpa: 7.8, attendance: 85, studyHours: 10, backlogs: 1 },
      { period: 'Semester 2', cgpa: 8.1, attendance: 87, studyHours: 12, backlogs: 1 },
      { period: 'Semester 3', cgpa: 8.4, attendance: 89, studyHours: 14, backlogs: 0 },
      { period: 'Semester 4', cgpa: 8.65, attendance: 90, studyHours: 15, backlogs: 0 },
      { period: 'Semester 5', cgpa: 8.85, attendance: 92, studyHours: 16, backlogs: 0 },
    ];
  };

  const trendData = getTrendData();

  return (
    <div className="space-y-6">
      {/* Header & Time Range Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Historical Student Performance & Trend Analytics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {studentName ? `Analyzing trend performance for ${studentName}` : 'Institutional batch trend comparison'}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['30d', '3m', '6m', '1y', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all uppercase text-[11px] ${
                timeRange === range ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {range === '30d' ? '30 Days' : range === '3m' ? '3 Months' : range === '6m' ? '6 Months' : range === '1y' ? '1 Year' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CGPA & Attendance Trend Line Chart */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            CGPA & Attendance Growth Trend
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="left" stroke="#818cf8" fontSize={11} domain={[0, 10]} />
                <YAxis yAxisId="right" orientation="right" stroke="#34d399" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="cgpa" stroke="#818cf8" strokeWidth={3} name="CGPA (Scale 10)" />
                <Line yAxisId="right" type="monotone" dataKey="attendance" stroke="#34d399" strokeWidth={2} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Study Hours & Backlog Trend Bar Chart */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Weekly Study Hours vs Backlogs Progression
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend />
                <Bar dataKey="studyHours" fill="#a855f7" radius={[6, 6, 0, 0]} name="Study Hours / Wk" />
                <Bar dataKey="backlogs" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Active Backlogs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
