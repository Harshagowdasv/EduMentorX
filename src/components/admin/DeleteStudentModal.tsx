import React, { useState } from 'react';
import { Student } from '../../types';
import { dbService } from '../../services/serviceFactory';
import { Modal } from '../common/Modal';
import { AlertTriangle, ShieldAlert, Lock, Trash2, CheckCircle2 } from 'lucide-react';

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  actorId: string;
  onSuccess?: () => void;
}

export const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  actorId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmUsn, setConfirmUsn] = useState('');

  if (!isOpen || !student) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmUsn.trim().toUpperCase() !== student.usn.trim().toUpperCase()) {
      setError(`Please type '${student.usn}' to confirm deletion.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await dbService.deleteStudent(student.id, actorId);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to delete student:', err);
      setError(err.message || 'Failed to delete student account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Deactivate & Archive Student — ${student.name}`} maxWidth="md">
      <form onSubmit={handleDelete} className="space-y-4 text-xs">
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-400" /> Confirm Student Account Deactivation
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            You are about to deactivate student <strong className="text-white">{student.name}</strong> (<span className="font-mono text-indigo-300">{student.usn}</span>).
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-slate-300 text-[11px]">
          <h5 className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" /> Security & Compliance Actions
          </h5>
          <ul className="space-y-1 list-disc list-inside text-slate-400">
            <li>Disables Firebase Authentication account (prevents sign-in).</li>
            <li>Clears active mentor allocation & mentee directory mapping.</li>
            <li>Preserves historical interventions, audit logs, and meeting notes for institutional compliance.</li>
            <li>Operation is reversible by backend/admin if recovery is needed.</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> {error}
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Type USN <strong className="font-mono text-white">{student.usn}</strong> to confirm:
          </label>
          <input
            type="text"
            required
            value={confirmUsn}
            onChange={(e) => setConfirmUsn(e.target.value)}
            placeholder={student.usn}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs uppercase"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || confirmUsn.trim().toUpperCase() !== student.usn.trim().toUpperCase()}
            className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 font-bold text-white flex items-center gap-2 shadow-lg shadow-rose-600/30"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Deactivating...' : 'Confirm Deactivation'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
