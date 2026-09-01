import React from 'react';
import { UserRole } from '../../types';
import { ShieldCheck, UserCheck, GraduationCap } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  userId: string;
  userName: string;
  role: UserRole;
  department?: string;
  avatarUrl?: string;
  onNavigateSection?: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  userId,
  userName,
  role,
  department,
  avatarUrl,
  onNavigateSection,
}) => {
  return (
    <header className="h-16 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Role Badge */}
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/60 flex items-center gap-1.5">
          {role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
          {role === 'mentor' && <UserCheck className="w-3.5 h-3.5 text-purple-400" />}
          {role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-sky-400" />}
          {role} Portal
        </span>
        {department && <span className="text-xs text-slate-400 hidden md:inline">• {department}</span>}
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-4">
        <NotificationDropdown userId={userId} role={role} onNavigateSection={onNavigateSection} />

        <div className="flex items-center gap-3 text-right">
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-white leading-tight">{userName}</p>
            <p className="text-[10px] text-slate-400 uppercase font-mono">{role}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
            {userName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
