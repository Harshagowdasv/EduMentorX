import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/serviceFactory';
import {
  Calendar,
  FileText,
  BookOpen,
  CheckSquare,
  FileDown,
  Award,
  RefreshCw,
  Clock,
  UserCheck
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'meeting' | 'note' | 'course' | 'activity' | 'resource' | 'portfolio' | 'reassignment';
  title: string;
  description: string;
  timestamp: string;
  actorName?: string;
}

interface StudentProgressTimelineProps {
  studentId: string;
}

export const StudentProgressTimeline: React.FC<StudentProgressTimelineProps> = ({ studentId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [studentId]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const [meetings, notes, courses, activities, resources, allocations, portfolio] = await Promise.all([
        dbService.getMeetings({ studentId }),
        dbService.getMentorNotes(studentId),
        dbService.getAssignedCourses(studentId),
        dbService.getAssignedActivities(studentId),
        dbService.getSharedResources(undefined, studentId),
        dbService.getAllocationHistory(studentId),
        dbService.getStudentPortfolio(studentId),
      ]);

      const list: TimelineEvent[] = [];

      meetings.forEach((m) => {
        list.push({
          id: `t_m_${m.id}`,
          type: 'meeting',
          title: `Mentor Session: ${m.title}`,
          description: `Date: ${m.date} at ${m.time}. Status: ${m.status}`,
          timestamp: m.createdAt,
          actorName: m.mentorName,
        });
      });

      notes.forEach((n) => {
        list.push({
          id: `t_n_${n.id}`,
          type: 'note',
          title: `Mentorship Log (${n.category})`,
          description: n.content,
          timestamp: n.timestamp,
          actorName: n.mentorName,
        });
      });

      courses.forEach((c) => {
        list.push({
          id: `t_c_${c.id}`,
          type: 'course',
          title: `Course Assigned: ${c.title}`,
          description: `Platform: ${c.platform}. Progress: ${c.completionPercentage || 0}%`,
          timestamp: c.assignedDate,
          actorName: c.assignedByMentorName,
        });
      });

      activities.forEach((a) => {
        list.push({
          id: `t_a_${a.id}`,
          type: 'activity',
          title: `Activity: ${a.title}`,
          description: `Due: ${a.dueDate}. Status: ${a.status}`,
          timestamp: a.assignedDate,
        });
      });

      resources.forEach((r) => {
        list.push({
          id: `t_r_${r.id}`,
          type: 'resource',
          title: `Study Resource Shared: ${r.title}`,
          description: `Category: ${r.category} (${r.fileType})`,
          timestamp: r.timestamp,
          actorName: r.sharedByMentorName,
        });
      });

      allocations.forEach((alloc) => {
        list.push({
          id: `t_alloc_${alloc.id}`,
          type: 'reassignment',
          title: `Mentor Reallocation Event`,
          description: `Reassigned from ${alloc.previousMentorName || 'Unallocated'} to ${alloc.newMentorName}`,
          timestamp: alloc.timestamp,
          actorName: alloc.changedBy,
        });
      });

      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEvents(list);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'meeting':
        return <Calendar className="w-4 h-4 text-indigo-400" />;
      case 'note':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'activity':
        return <CheckSquare className="w-4 h-4 text-sky-400" />;
      case 'resource':
        return <FileDown className="w-4 h-4 text-amber-400" />;
      case 'reassignment':
        return <RefreshCw className="w-4 h-4 text-rose-400" />;
      default:
        return <Award className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <Clock className="w-4 h-4 text-indigo-400" /> Chronological Academic Progress Timeline
      </h3>

      {loading ? (
        <div className="p-6 text-center text-xs text-slate-400">Loading timeline...</div>
      ) : events.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">No events logged in timeline yet.</div>
      ) : (
        <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 py-2">
          {events.map((evt) => (
            <div key={evt.id} className="relative pl-6">
              <div className="absolute -left-[17px] top-0.5 p-1.5 rounded-full bg-slate-900 border border-slate-700 shadow-md">
                {getIcon(evt.type)}
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">{evt.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(evt.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{evt.description}</p>
                {evt.actorName && (
                  <p className="text-[10px] text-slate-500 pt-1">Logged by: {evt.actorName}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
