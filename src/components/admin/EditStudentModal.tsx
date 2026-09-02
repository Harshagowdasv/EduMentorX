import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { dbService } from '../../services/serviceFactory';
import { Modal } from '../common/Modal';
import { User, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  actorId: string;
  onSuccess?: () => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  actorId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        department: student.department || 'Computer Science & Engineering',
        year: student.year || '3rd Year',
        semester: student.semester || 'Semester 6',
        section: student.section || 'A',
        admissionYear: student.admissionYear || '2023',
        cgpa: student.cgpa ?? 8.0,
        attendance: student.attendance ?? 85,
        financialScore: student.financialScore ?? 5,
        studyHours: student.studyHours ?? 15,
        previousYearBacklogs: student.previousYearBacklogs ?? 0,
        currentBacklogs: student.currentBacklogs ?? 0,
        academicStatus: student.academicStatus || 'Active',
      });
      setError(null);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await dbService.editStudent(student.id, formData, actorId);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to edit student:', err);
      setError(err.message || 'Failed to update student profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Student Profile — ${student.name}`} maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
        {/* Immutable Info Header */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider">Immutable Student Identifiers</span>
            <p className="font-bold text-white text-xs">
              USN: <span className="font-mono text-indigo-300">{student.usn}</span> • ID: <span className="font-mono text-slate-400">{student.id}</span>
            </p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-md">
            Audited Action
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" /> {error}
          </div>
        )}

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Department</label>
            <input
              type="text"
              value={formData.department || ''}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Year of Study</label>
            <select
              value={formData.year || ''}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Semester</label>
            <select
              value={formData.semester || ''}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
              <option value="Semester 5">Semester 5</option>
              <option value="Semester 6">Semester 6</option>
              <option value="Semester 7">Semester 7</option>
              <option value="Semester 8">Semester 8</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Section</label>
            <input
              type="text"
              value={formData.section || ''}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Admission Year</label>
            <input
              type="text"
              value={formData.admissionYear || ''}
              onChange={(e) => setFormData({ ...formData, admissionYear: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">CGPA (0 - 10.0)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={formData.cgpa ?? 0}
              onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Attendance Rate (0 - 100%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.attendance ?? 0}
              onChange={(e) => setFormData({ ...formData, attendance: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Financial Score (1 - 10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.financialScore ?? 5}
              onChange={(e) => setFormData({ ...formData, financialScore: parseInt(e.target.value, 10) || 5 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Study Hours / Week</label>
            <input
              type="number"
              min="0"
              value={formData.studyHours ?? 0}
              onChange={(e) => setFormData({ ...formData, studyHours: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Previous Year Backlogs</label>
            <input
              type="number"
              min="0"
              value={formData.previousYearBacklogs ?? 0}
              onChange={(e) => setFormData({ ...formData, previousYearBacklogs: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-rose-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Current Active Backlogs</label>
            <input
              type="number"
              min="0"
              value={formData.currentBacklogs ?? 0}
              onChange={(e) => setFormData({ ...formData, currentBacklogs: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-rose-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Academic Status</label>
            <select
              value={formData.academicStatus || 'Active'}
              onChange={(e) => setFormData({ ...formData, academicStatus: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
            >
              <option value="Active">Active</option>
              <option value="Academic Warning">Academic Warning</option>
              <option value="Probation">Probation</option>
              <option value="Graduated">Graduated</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-indigo-600 font-bold text-white hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-600/30"
          >
            {loading ? 'Saving Changes...' : 'Save & Recalculate Risk'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
