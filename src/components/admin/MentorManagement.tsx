import React, { useState, useEffect } from 'react';
import { Mentor, Student } from '../../types';
import { dbService } from '../../services/serviceFactory';
import { Modal } from '../common/Modal';
import { UserCheck, Plus, Search, Filter, Mail, Phone, Building2, UserX, Eye } from 'lucide-react';

interface MentorManagementProps {
  onSelectMentor: (mentor: Mentor) => void;
  actorId: string;
}

export const MentorManagement: React.FC<MentorManagementProps> = ({ onSelectMentor, actorId }) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [staffId, setStaffId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    setLoading(true);
    try {
      const data = await dbService.getMentors();
      setMentors(data);
    } catch (err) {
      console.error('Error loading mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !staffId) return;
    setSaving(true);

    try {
      await dbService.createMentor(
        {
          userId: `u_m_${Date.now()}`,
          name,
          email,
          phone,
          department,
          staffId,
        },
        actorId
      );
      setName('');
      setEmail('');
      setPhone('');
      setStaffId('');
      setIsCreateModalOpen(false);
      await loadMentors();
    } catch (err) {
      console.error('Failed to create mentor:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (mentor: Mentor) => {
    if (confirm(`Deactivate mentor ${mentor.name}? assigned mentees will become unallocated.`)) {
      await dbService.deactivateMentor(mentor.id, actorId);
      await loadMentors();
    }
  };

  const filteredMentors = mentors.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.staffId.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !deptFilter || m.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Institutional Mentor Management</h2>
          <p className="text-xs text-slate-400 mt-1">Manage faculty mentors, departments, and mentee workloads</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Mentor
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by mentor name, email, or staff ID..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="relative">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            <option value="Information Science & Engineering">Information Science & Engineering</option>
            <option value="Electronics & Communication">Electronics & Communication</option>
          </select>
        </div>
      </div>

      {/* Mentors Table */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/80 overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading mentor directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="p-4">Staff ID</th>
                  <th className="p-4">Mentor Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Active Mentees</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredMentors.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-400">{m.staffId}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 font-bold flex items-center justify-center">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{m.name}</p>
                          <p className="text-[11px] text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-300">{m.department}</td>
                    <td className="p-4 text-slate-400">{m.phone || 'N/A'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-bold">
                        {m.activeMenteesCount} Mentees
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectMentor(m)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-bold border border-indigo-500/30 transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                      <button
                        onClick={() => handleDeactivate(m)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold border border-rose-800/40 transition-all inline-flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" /> Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Mentor Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Faculty Mentor" subtitle="Onboard a new mentor into institutional records">
        <form onSubmit={handleCreateMentor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Staff / Employee ID</label>
            <input
              type="text"
              required
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="e.g. EMP-CS-105"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Alan Turing"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Institutional Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alan.turing@edumentorx.edu"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Science & Engineering">Information Science & Engineering</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all mt-2"
          >
            {saving ? 'Creating Mentor Account...' : 'Confirm Mentor Creation'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
