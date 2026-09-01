import React, { useState } from 'react';
import { Meeting, AIMeetingSummary } from '../../types';
import { dbService } from '../../services/serviceFactory';
import { Modal } from '../common/Modal';
import { Sparkles, CheckCircle2, Plus, FileText, CheckSquare, Target } from 'lucide-react';

interface AIMeetingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  mentorId: string;
}

export const AIMeetingSummaryModal: React.FC<AIMeetingSummaryModalProps> = ({
  isOpen,
  onClose,
  meeting,
  mentorId,
}) => {
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState<AIMeetingSummary | null>(null);
  const [approved, setApproved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      // Deterministic AI Meeting Summary Engine
      const mockSummaryText = `Productive guidance session covering ${meeting.title}. Addressed study consistency and project milestones.`;
      const mockConcerns = ['Needs improved practice discipline in Data Structures', 'Scared of exam time limit'];
      const mockActions = ['Complete 15 recursion problems', 'Schedule follow-up review before mid-terms'];

      const newSummary = await dbService.saveAIMeetingSummary({
        meetingId: meeting.id,
        studentId: meeting.studentId,
        mentorId,
        summaryText: mockSummaryText,
        keyConcerns: mockConcerns,
        actionItems: mockActions,
        followUpDate: '2026-09-05',
        approvedByMentor: false,
      });

      setSummary(newSummary);
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveAndSave = async () => {
    if (!summary) return;
    setSaving(true);
    try {
      summary.approvedByMentor = true;
      await dbService.saveAIMeetingSummary(summary);
      setApproved(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      console.error('Failed to approve AI summary:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExtractTask = async (actionText: string) => {
    await dbService.createFollowUpTask(
      {
        studentId: meeting.studentId,
        studentName: meeting.studentName,
        mentorId,
        mentorName: meeting.mentorName,
        title: actionText,
        description: 'Auto-extracted from approved AI Meeting Summary',
        dueDate: '2026-09-10',
        priority: 'HIGH',
      },
      mentorId
    );
    alert(`Task "${actionText}" created and assigned to student!`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Meeting Summary & Action Item Extractor">
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <p className="font-bold text-white text-sm">{meeting.title}</p>
          <p className="text-slate-400">Student: {meeting.studentName} • Date: {meeting.date}</p>
        </div>

        {!summary ? (
          <button
            onClick={handleGenerateSummary}
            disabled={generating}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating AI Meeting Summary...' : 'Generate AI Summary & Extract Action Items'}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" /> AI Executive Summary
              </h4>
              <p className="text-xs text-slate-300 leading-normal">{summary.summaryText}</p>

              <div>
                <h5 className="font-bold text-rose-400 text-[11px] uppercase mb-1">Key Discussion Concerns</h5>
                <div className="space-y-1">
                  {summary.keyConcerns.map((c, idx) => (
                    <p key={idx} className="text-slate-300 text-xs">• {c}</p>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-bold text-emerald-400 text-[11px] uppercase mb-1">Extracted Action Items (1-Click Approval)</h5>
                <div className="space-y-1.5">
                  {summary.actionItems.map((act, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-slate-200">• {act}</span>
                      <button
                        onClick={() => handleExtractTask(act)}
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Create Task
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
                Close
              </button>
              <button
                type="button"
                onClick={handleApproveAndSave}
                disabled={saving || approved}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {approved ? 'Approved & Recorded!' : 'Approve & Save Official Summary'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
