import React, { useState, useEffect } from 'react';
import {
  MentorNote,
  AssignedCourse,
  AssignedActivity,
  SharedResource
} from '../../types';
import { dbService } from '../../services/serviceFactory';
import { BookOpen, FileText, Share2, CheckCircle2, Clock, ExternalLink } from 'lucide-react';

interface MentorUpdatesTimelineProps {
  studentId: string;
}

export const MentorUpdatesTimeline: React.FC<MentorUpdatesTimelineProps> = ({ studentId }) => {
  const [notes, setNotes] = useState<MentorNote[]>([]);
  const [courses, setCourses] = useState<AssignedCourse[]>([]);
  const [activities, setActivities] = useState<AssignedActivity[]>([]);
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimelineData();
  }, [studentId]);

  const loadTimelineData = async () => {
    setLoading(true);
    try {
      const s = await dbService.getStudentById(studentId);
      const [nList, cList, aList, rList] = await Promise.all([
        dbService.getMentorNotes(studentId),
        dbService.getAssignedCourses(studentId),
        dbService.getAssignedActivities(studentId),
        dbService.getSharedResources(s?.department, studentId),
      ]);

      setNotes(nList);
      setCourses(cList);
      setActivities(aList);
      setResources(rList);
    } catch (err) {
      console.error('Failed to load mentor updates:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Mentor Updates Timeline</h2>
        <p className="text-xs text-slate-400 mt-1">Chronological feed of courses, activities, notes, and resources shared by your mentor</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading timeline feed...</div>
      ) : (
        <div className="space-y-4">
          {/* Notes Section */}
          {notes.map((n) => (
            <div key={n.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white text-sm">Mentor Guidance Note ({n.category})</span>
                  <span className="text-slate-400">{new Date(n.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{n.content}</p>
                <p className="text-[11px] text-slate-500 mt-2">By: {n.mentorName}</p>
              </div>
            </div>
          ))}

          {/* Courses Section */}
          {courses.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white text-sm">Assigned Course: {c.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800">
                    {c.status}
                  </span>
                </div>
                <p className="text-slate-400">Platform: {c.platform}</p>
                <a href={c.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1 mt-2 font-bold">
                  Access Learning Module <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}

          {/* Resources Section */}
          {resources.map((r) => (
            <div key={r.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-sky-950 text-sky-400 border border-sky-800 shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white text-sm">Shared Study Resource: {r.title}</span>
                  <span className="text-slate-400">{new Date(r.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-400">Category: {r.category} | Format: {r.fileType}</p>
                <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1 mt-2 font-bold">
                  Download Attachment <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
