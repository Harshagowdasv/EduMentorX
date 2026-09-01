import React, { useState, useEffect } from 'react';
import { AcademicCalendarEvent, EventType } from '../../types';
import { dbService } from '../../services/serviceFactory';
import { Modal } from '../common/Modal';
import { Calendar as CalendarIcon, Plus, Filter, Tag, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface AcademicCalendarManagerProps {
  userRole: 'admin' | 'mentor' | 'student';
  userId: string;
  department?: string;
}

export const AcademicCalendarManager: React.FC<AcademicCalendarManagerProps> = ({
  userRole,
  userId,
  department,
}) => {
  const [events, setEvents] = useState<AcademicCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('EXAM');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [targetDept, setTargetDept] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [department]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const list = await dbService.getCalendarEvents(department);
      setEvents(list);
    } catch (err) {
      console.error('Failed to load calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate) return;
    setSaving(true);

    try {
      await dbService.createCalendarEvent({
        title,
        description,
        eventType,
        startDate,
        endDate: endDate || startDate,
        department: targetDept || undefined,
        semester: 'Semester 6',
        createdBy: userRole,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      await loadEvents();
    } catch (err) {
      console.error('Failed to create calendar event:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredEvents = events.filter((e) => filterType === 'ALL' || e.eventType === filterType);

  const getEventTypeBadge = (type: EventType) => {
    switch (type) {
      case 'EXAM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950 text-rose-400 border border-rose-800">Exam</span>;
      case 'PLACEMENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800">Placement</span>;
      case 'PROJECT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">Project</span>;
      case 'WORKSHOP':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">Workshop</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">Event</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Event Type Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            Institutional Academic Calendar & Events
          </h2>
          <p className="text-xs text-slate-400 mt-1">Exams, placement drives, workshops, and project submission deadlines</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="ALL">All Event Types</option>
            <option value="EXAM">Exams</option>
            <option value="PLACEMENT">Placements</option>
            <option value="PROJECT">Projects</option>
            <option value="WORKSHOP">Workshops</option>
            <option value="HOLIDAY">Holidays</option>
          </select>

          {userRole === 'admin' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Event
            </button>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400">Loading academic calendar...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
            No academic calendar events scheduled.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div key={evt.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {getEventTypeBadge(evt.eventType)}
                  <span className="text-[10px] text-slate-400 font-mono">{evt.startDate}</span>
                </div>
                <h4 className="font-bold text-white text-sm leading-snug">{evt.title}</h4>
                {evt.description && <p className="text-xs text-slate-400 leading-normal">{evt.description}</p>}
              </div>

              {evt.department && (
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Dept: {evt.department}</span>
                  <span>{evt.semester}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Event Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Institutional Calendar Event">
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mid-Semester Internal Assessment 1"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e: any) => setEventType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="EXAM">Internal Examination</option>
                <option value="ASSIGNMENT">Assignment Deadline</option>
                <option value="PROJECT">Project Milestone</option>
                <option value="PLACEMENT">Placement Drive</option>
                <option value="WORKSHOP">Technical Workshop</option>
                <option value="HOLIDAY">Holiday</option>
                <option value="OTHER">Other Event</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Description & Syllabus Coverage</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event details or submission requirements..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white h-20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
              {saving ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
