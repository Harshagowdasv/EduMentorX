import React, { useState, useEffect } from 'react';
import { InterventionRecord, Student, InterventionStatus } from '../../types';
import { dbService } from '../../services/serviceFactory';
import { Modal } from '../common/Modal';
import { ShieldAlert, Plus, CheckCircle2, ArrowRight, Clock, AlertTriangle, Users, Calendar, CheckSquare } from 'lucide-react';

interface InterventionCenterProps {
  mentorId: string;
  mentorName: string;
  onViewStudent360: (studentId: string) => void;
  actorId: string;
}

export const InterventionCenter: React.FC<InterventionCenterProps> = ({
  mentorId,
  mentorName,
  onViewStudent360,
  actorId,
}) => {
  const [interventions, setInterventions] = useState<InterventionRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [triggerReasons, setTriggerReasons] = useState('Attendance dropped below 70%, CGPA decline observed.');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [mentorId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [iList, stList] = await Promise.all([
        dbService.getInterventions({ mentorId }),
        dbService.getStudentsByMentorId(mentorId),
      ]);
      setInterventions(iList);
      setStudents(stList);
    } catch (err) {
      console.error('Failed to load interventions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setSaving(true);

    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;

    try {
      await dbService.createIntervention(
        {
          studentId: st.id,
          studentName: st.name,
          studentUsn: st.usn,
          mentorId,
          mentorName,
          priority: st.riskLevel,
          triggerReasons: triggerReasons.split('\n').filter(Boolean),
          status: 'IDENTIFIED',
          actionsTaken: ['Initiated intervention workflow in Faculty Workspace'],
          followUpTaskIds: [],
          baselineCgpa: st.cgpa,
          baselineAttendance: st.attendance,
        },
        actorId
      );
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to initiate intervention:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAdvanceStatus = async (interventionId: string, currentStatus: InterventionStatus) => {
    const statusOrder: InterventionStatus[] = ['IDENTIFIED', 'CONTACT_PENDING', 'MEETING_SCHEDULED', 'IN_PROGRESS', 'MONITORING', 'RESOLVED'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    if (currentIdx < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIdx + 1];
      await dbService.updateInterventionStatus(interventionId, nextStatus, undefined, undefined, undefined, actorId);
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border border-rose-800/80 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-600/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Faculty Mentorship Intervention Center</h2>
            <p className="text-xs text-slate-300">Proactive student risk detection, structured intervention lifecycles, and outcome tracking</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Initiate Student Intervention
        </button>
      </div>

      {/* Interventions Board */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading intervention records...</div>
        ) : interventions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
            No active student interventions logged. All mentees are performing in Good Standing.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interventions.map((interv) => (
              <div key={interv.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{interv.studentName}</h4>
                    <p className="text-xs text-slate-400">USN: {interv.studentUsn}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border ${
                      interv.status === 'RESOLVED'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border-rose-800'
                    }`}
                  >
                    {interv.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Baseline Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Baseline CGPA</span>
                    <span className="font-bold text-indigo-300 text-sm">{interv.baselineCgpa}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Baseline Attendance</span>
                    <span className="font-bold text-rose-400 text-sm">{interv.baselineAttendance}%</span>
                  </div>
                </div>

                {/* Trigger Reasons */}
                <div className="space-y-1">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase">Trigger Reasons</h5>
                  {interv.triggerReasons.map((r, idx) => (
                    <p key={idx} className="text-xs text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                      • {r}
                    </p>
                  ))}
                </div>

                {/* Actions & Lifecycle Navigation */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onViewStudent360(interv.studentId)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                  >
                    Inspect 360°
                  </button>

                  {interv.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleAdvanceStatus(interv.id, interv.status)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
                    >
                      Advance Status <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Initiate Student Intervention Workflow">
        <form onSubmit={handleInitiateIntervention} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Select Student</label>
            <select
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="">Select Mentee...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.usn}) — CGPA {s.cgpa}, Attendance {s.attendance}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Trigger Reasons & Performance Observations</label>
            <textarea
              required
              value={triggerReasons}
              onChange={(e) => setTriggerReasons(e.target.value)}
              placeholder="Detail reasons for initiating intervention..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white h-24"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold">
              {saving ? 'Initiating...' : 'Initiate Intervention'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
