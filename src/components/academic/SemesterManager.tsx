import React, { useState, useEffect } from 'react';
import { AcademicYear, Semester } from '../../types';
import { dbService } from '../../services/serviceFactory';
import { Building2, Plus, CheckCircle2, Archive, Calendar } from 'lucide-react';

export const SemesterManager: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [yearsList, semList] = await Promise.all([
        dbService.getAcademicYears(),
        dbService.getSemesters(),
      ]);
      setAcademicYears(yearsList);
      setSemesters(semList);
    } catch (err) {
      console.error('Failed to load academic structure:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Institutional Academic Year & Semester Structure
            </h2>
            <p className="text-xs text-slate-400 mt-1">Configure active semester windows, term archives, and academic calendars</p>
          </div>
        </div>
      </div>

      {/* Grid of Academic Years */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {academicYears.map((ay) => {
          const yearSemesters = semesters.filter((s) => s.academicYearId === ay.id);
          return (
            <div key={ay.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-base">{ay.yearName} Academic Year</h3>
                  <p className="text-[11px] text-slate-400">{ay.startDate} to {ay.endDate}</p>
                </div>
                {ay.isActive && (
                  <span className="px-2.5 py-1 text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Term
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Associated Semesters</h4>
                {yearSemesters.map((sem) => (
                  <div key={sem.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{sem.name}</p>
                      <p className="text-[11px] text-slate-400">{sem.startDate} — {sem.endDate}</p>
                    </div>
                    {sem.isActive ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 rounded">
                        Active Semester
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-900 text-slate-500 rounded flex items-center gap-1">
                        <Archive className="w-3 h-3" /> Archived
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
