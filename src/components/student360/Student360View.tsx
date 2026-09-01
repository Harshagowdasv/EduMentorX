import React, { useState, useEffect } from 'react';
import { Student, UserRole, InterventionRecord } from '../../types';
import { dbService } from '../../services/serviceFactory';
import { Modal } from '../common/Modal';
import { StudentProgressTimeline } from '../workflow/StudentProgressTimeline';
import {
  User,
  GraduationCap,
  Calendar,
  AlertTriangle,
  FileText,
  BookOpen,
  Award,
  ShieldAlert,
  Clock,
  Activity,
  History,
  Target,
  Phone,
  Mail,
  MapPin,
  Heart,
  Code,
  Github,
  Linkedin,
  DollarSign
} from 'lucide-react';

interface Student360ViewProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  userRole: UserRole;
}

export const Student360View: React.FC<Student360ViewProps> = ({
  isOpen,
  onClose,
  studentId,
  userRole,
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [interventions, setInterventions] = useState<InterventionRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'biodata' | 'interventions' | 'timeline'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && studentId) {
      loadStudent360();
    }
  }, [isOpen, studentId]);

  const loadStudent360 = async () => {
    setLoading(true);
    try {
      const [st, iList] = await Promise.all([
        dbService.getStudentById(studentId),
        dbService.getInterventions({ studentId }),
      ]);
      setStudent(st);
      setInterventions(iList);
    } catch (err) {
      console.error('Failed to load Student 360:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Student 360° Profile — ${student ? student.name : 'Loading'}`} maxWidth="6xl">
      <div className="space-y-6 text-xs max-h-[82vh] overflow-y-auto pr-1">
        {loading || !student ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading Student 360° Profile...</div>
        ) : (
          <>
            {/* Header Info Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 font-extrabold text-white text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {student.name} <span className="text-xs text-slate-400 font-mono">({student.usn})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {student.department} • {student.program || 'B.Tech'} {student.year || '3rd Year'} • Mentor: {student.mentorName || 'Unallocated'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border ${
                    student.riskLevel === 'GOOD_PERFORMANCE'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : student.riskLevel === 'HIGH_PRIORITY'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  {student.riskLevel.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${
                  activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" /> Academic Performance
              </button>

              <button
                onClick={() => setActiveTab('biodata')}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${
                  activeTab === 'biodata' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" /> Institutional Biodata
              </button>

              {userRole !== 'student' && (
                <button
                  onClick={() => setActiveTab('interventions')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${
                    activeTab === 'interventions' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" /> Interventions ({interventions.length})
                </button>
              )}

              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${
                  activeTab === 'timeline' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" /> Timeline
              </button>
            </div>

            {/* TAB: ACADEMIC OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">CGPA Score</span>
                    <span className="font-extrabold text-indigo-300 text-lg">{student.cgpa}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Attendance Rate</span>
                    <span className="font-extrabold text-emerald-400 text-lg">{student.attendance}%</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Weekly Study Hours</span>
                    <span className="font-extrabold text-purple-300 text-lg">{student.studyHours} hrs</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Active Backlogs</span>
                    <span className="font-extrabold text-rose-400 text-lg">{student.previousYearBacklogs || student.currentBacklogs || 0}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">Explainable Risk Factors</h4>
                  <div className="space-y-1">
                    {student.riskReasons.map((r, idx) => (
                      <p key={idx} className="text-slate-300 text-xs bg-slate-900 p-2 rounded-lg border border-slate-800">
                        • {r}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INSTITUTIONAL BIODATA */}
            {activeTab === 'biodata' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Personal Information */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <User className="w-4 h-4 text-indigo-400" /> Personal Details
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    <p><span className="text-slate-400">Full Name:</span> <strong className="text-white">{student.name}</strong></p>
                    <p><span className="text-slate-400">USN:</span> <strong className="text-indigo-300 font-mono">{student.usn}</strong></p>
                    <p><span className="text-slate-400">Date of Birth:</span> <span className="text-slate-200">{student.dateOfBirth || 'N/A'}</span></p>
                    <p><span className="text-slate-400">Gender:</span> <span className="text-slate-200">{student.gender || 'N/A'}</span></p>
                    <p><span className="text-slate-400">Blood Group:</span> <span className="text-rose-400 font-bold">{student.bloodGroup || 'N/A'}</span></p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Mail className="w-4 h-4 text-indigo-400" /> Contact Details
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    <p><span className="text-slate-400">Student Email:</span> <span className="text-white font-mono">{student.email}</span></p>
                    <p><span className="text-slate-400">Student Phone:</span> <span className="text-slate-200">{student.phone || 'N/A'}</span></p>
                    <p><span className="text-slate-400">Parent Phone:</span> <span className="text-slate-200">{student.parentPhone || 'N/A'}</span></p>
                    <p><span className="text-slate-400">Address:</span> <span className="text-slate-200">{student.address || 'N/A'}</span></p>
                    <p><span className="text-slate-400">City / State / Pincode:</span> <span className="text-slate-200">{student.city || 'N/A'}, {student.state || 'N/A'} - {student.pincode || 'N/A'}</span></p>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Heart className="w-4 h-4 text-rose-400" /> Emergency Contact
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    <p><span className="text-slate-400">Contact Name:</span> <strong className="text-white">{student.emergencyContactName || 'N/A'}</strong></p>
                    <p><span className="text-slate-400">Contact Phone:</span> <span className="text-slate-200">{student.emergencyContactPhone || 'N/A'}</span></p>
                    <p><span className="text-slate-400">Relationship:</span> <span className="text-slate-200">{student.emergencyContactRelationship || 'N/A'}</span></p>
                  </div>
                </div>

                {/* Academic Structure */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <GraduationCap className="w-4 h-4 text-indigo-400" /> Academic & Program Structure
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    <p><span className="text-slate-400">Department:</span> <strong className="text-white">{student.department}</strong></p>
                    <p><span className="text-slate-400">Program / Degree:</span> <span className="text-slate-200">{student.program || 'B.Tech'}</span></p>
                    <p><span className="text-slate-400">Academic Year / Semester:</span> <span className="text-slate-200">{student.year || '3rd Year'} ({student.semester || 'Semester 6'})</span></p>
                    <p><span className="text-slate-400">Section / Admission Year:</span> <span className="text-slate-200">Sec {student.section || 'A'} (Batch {student.admissionYear || '2023'})</span></p>
                    <p><span className="text-slate-400">Academic Status:</span> <span className="text-emerald-400 font-bold">{student.academicStatus || 'Active'}</span></p>
                  </div>
                </div>

                {/* Career Profile */}
                <div className="col-span-full p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Code className="w-4 h-4 text-purple-400" /> Career Profile & Handles
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <p><span className="text-slate-400">Target Career Goal:</span> <strong className="text-indigo-300">{student.careerGoal || 'Full-Stack Developer'}</strong></p>
                      <p className="mt-1"><span className="text-slate-400">Skills:</span> {student.skills ? student.skills.join(', ') : 'React, TypeScript, Cloud'}</p>
                    </div>
                    <div className="space-y-1">
                      {student.github && <p><span className="text-slate-400">GitHub:</span> <a href={student.github} target="_blank" rel="noreferrer" className="text-indigo-400 underline">{student.github}</a></p>}
                      {student.leetcode && <p><span className="text-slate-400">LeetCode:</span> <a href={student.leetcode} target="_blank" rel="noreferrer" className="text-indigo-400 underline">{student.leetcode}</a></p>}
                      {student.linkedin && <p><span className="text-slate-400">LinkedIn:</span> <a href={student.linkedin} target="_blank" rel="noreferrer" className="text-indigo-400 underline">{student.linkedin}</a></p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INTERVENTIONS */}
            {activeTab === 'interventions' && userRole !== 'student' && (
              <div className="space-y-3">
                {interventions.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">No intervention records logged for this student.</p>
                ) : (
                  interventions.map((i) => (
                    <div key={i.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs font-mono">{i.createdAt.substring(0, 10)}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-950 text-rose-300 border border-rose-800">
                          {i.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">Baseline CGPA: {i.baselineCgpa} | Baseline Attendance: {i.baselineAttendance}%</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: TIMELINE */}
            {activeTab === 'timeline' && <StudentProgressTimeline studentId={student.id} />}
          </>
        )}
      </div>
    </Modal>
  );
};
