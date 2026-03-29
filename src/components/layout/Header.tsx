'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { getInitials, cn, formatPoints } from '@/lib/utils';
import { LayoutDashboard, Compass, Trophy, UserCircle, Plus, ChevronDown, RotateCcw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/missions', label: 'Missions', icon: Compass },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

export default function Header() {
  const pathname = usePathname();
  const currentUserId = useStore(s => s.currentUserId);
  const users = useStore(s => s.users);
  const setCurrentUser = useStore(s => s.setCurrentUser);
  const resetData = useStore(s => s.resetData);
  const currentUser = users.find(u => u.id === currentUserId) ?? users[0];
  const [personaOpen, setPersonaOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toast = useToast(s => s.add);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPersonaOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="hidden text-lg font-semibold text-gray-900 sm:block">Missions</span>
        </Link>

        {/* Desktop nav — inline in the header */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-violet-50 text-violet-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/missions/new"
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Mission</span>
          </Link>

          <div className="hidden items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-sm sm:flex">
            <span className="font-semibold text-violet-600">{formatPoints(currentUser.pointsBalance)}</span>
            <span className="text-gray-400">pts</span>
          </div>

          {/* Persona switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setPersonaOpen(!personaOpen)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white">
                {getInitials(currentUser.name)}
              </div>
              <div className="hidden text-left lg:block">
                <div className="text-sm font-medium leading-tight text-gray-900">{currentUser.name}</div>
                <div className="text-[11px] leading-tight text-gray-400">{currentUser.roles.join(', ')}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {personaOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                <div className="mb-1 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Switch Persona
                </div>
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => { setCurrentUser(user.id); setPersonaOpen(false); toast(`Switched to ${user.name}`, 'info'); }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                      user.id === currentUserId ? 'bg-violet-50' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.title}</div>
                      <div className="text-[11px] text-gray-400">{user.roles.join(', ')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-violet-600">{user.levelName}</div>
                      <div className="text-[11px] text-gray-400">{formatPoints(user.pointsBalance)} pts</div>
                    </div>
                  </button>
                ))}
                <div className="mt-1 border-t border-gray-100 pt-1">
                  <button
                    onClick={() => { resetData(); setPersonaOpen(false); toast('Demo data reset to defaults', 'info'); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Demo Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
