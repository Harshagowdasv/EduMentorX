import React, { useState } from 'react';
import { Meeting } from '../../types';
import { dbService } from '../../services/serviceFactory';
import { Modal } from '../common/Modal';
import { Star, CheckCircle2 } from 'lucide-react';

interface StudentMeetingFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  studentId: string;
}

export const StudentMeetingFeedbackModal: React.FC<StudentMeetingFeedbackModalProps> = ({
  isOpen,
  onClose,
  meeting,
  studentId,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [concernAddressed, setConcernAddressed] = useState<'Yes' | 'Partially' | 'No'>('Yes');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dbService.submitMeetingFeedback({
        meetingId: meeting.id,
        studentId,
        mentorId: meeting.mentorId,
        rating,
        concernAddressed,
        comment,
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Private Mentor Session Feedback">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <p className="font-bold text-white text-sm">{meeting.title}</p>
          <p className="text-slate-400">Mentor: {meeting.mentorName} • Date: {meeting.date}</p>
        </div>

        <div>
          <label className="block font-bold text-slate-300 mb-2">How useful was this mentorship session?</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-2 rounded-xl transition-all ${
                  rating >= star ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-950 text-slate-600'
                }`}
              >
                <Star className="w-5 h-5 fill-current" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-300 mb-1">Was your primary academic/career concern addressed?</label>
          <div className="flex items-center gap-3">
            {(['Yes', 'Partially', 'No'] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                <input
                  type="radio"
                  name="concern"
                  checked={concernAddressed === opt}
                  onChange={() => setConcernAddressed(opt)}
                  className="accent-indigo-500"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-300 mb-1">Additional Feedback (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts on what went well or how future sessions could improve..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white h-20"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
            {saving ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
