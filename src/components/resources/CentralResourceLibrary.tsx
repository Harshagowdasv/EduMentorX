import React, { useState, useEffect } from 'react';
import { SharedResource, Student } from '../../types';
import { dbService } from '../../services/serviceFactory';
import { Modal } from '../common/Modal';
import { FileText, Search, Filter, Plus, Download, ExternalLink, Tag, Share2, Video, Globe, Code, BookOpen } from 'lucide-react';

interface CentralResourceLibraryProps {
  userRole: 'admin' | 'mentor' | 'student';
  userId: string;
  userName: string;
  department?: string;
}

export const CentralResourceLibrary: React.FC<CentralResourceLibraryProps> = ({
  userRole,
  userId,
  userName,
  department,
}) => {
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState<SharedResource['fileType']>('PDF');
  const [category, setCategory] = useState<SharedResource['category']>('Notes');
  const [targetStudentId, setTargetStudentId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadResources();
  }, [department, userId]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const [rList, stRes] = await Promise.all([
        dbService.getSharedResources(department, userRole === 'student' ? userId : undefined),
        userRole !== 'student' ? dbService.getStudents(1, 200) : Promise.resolve({ students: [] }),
      ]);
      setResources(rList);
      setStudents(stRes.students);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileUrl) return;
    setSaving(true);

    try {
      await dbService.shareResource(
        {
          title,
          description,
          subject,
          fileUrl,
          fileType,
          category,
          department: department || 'Computer Science & Engineering',
          studentId: targetStudentId || undefined,
          sharedByMentorId: userId,
          sharedByMentorName: userName,
        },
        userId
      );
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setFileUrl('');
      await loadResources();
    } catch (err) {
      console.error('Failed to share resource:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.subject && r.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const getFileTypeIcon = (type: SharedResource['fileType']) => {
    switch (type) {
      case 'Video':
        return <Video className="w-5 h-5 text-rose-400" />;
      case 'Website':
        return <Globe className="w-5 h-5 text-sky-400" />;
      case 'Coding Problem':
        return <Code className="w-5 h-5 text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Institutional Resource Library
          </h2>
          <p className="text-xs text-slate-400 mt-1">Centralized repository for lecture notes, problem sets, and study guides</p>
        </div>

        {userRole !== 'student' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Share Resource
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study resources by title, subject, or tag..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
        >
          <option value="all">All Categories</option>
          <option value="Notes">Lecture Notes</option>
          <option value="Assignment">Assignments</option>
          <option value="Syllabus">Syllabus & Guides</option>
          <option value="Reference">Reference Material</option>
        </select>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div key={res.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">{getFileTypeIcon(res.fileType)}</div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {res.category}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm leading-snug">{res.title}</h4>
                {res.subject && <span className="text-[11px] text-indigo-400 font-semibold">{res.subject}</span>}
                {res.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{res.description}</p>}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[10px]">By: {res.sharedByMentorName}</span>
              <a
                href={res.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" /> Access File
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Share Resource Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload & Share Institutional Study Resource">
        <form onSubmit={handleShareResource} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Resource Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Computer Networks Semester 6 Lecture Notes"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Networks"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">File Type</label>
              <select
                value={fileType}
                onChange={(e: any) => setFileType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="PDF">PDF Document</option>
                <option value="Document">Word / Text Doc</option>
                <option value="Video">Video Tutorial</option>
                <option value="Website">Website / Link</option>
                <option value="Coding Problem">Coding Problem Set</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Resource URL / Link</label>
            <input
              type="url"
              required
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://example.com/resources/file.pdf"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Share Target</label>
            <select
              value={targetStudentId}
              onChange={(e) => setTargetStudentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="">Entire Department Mentee Portfolio</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  Individual Student: {s.name} ({s.usn})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the study material..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white h-20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
              {saving ? 'Publishing...' : 'Publish & Share'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
