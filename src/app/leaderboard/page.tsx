'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatPoints, getInitials, cn } from '@/lib/utils';
import { getLevelInfo } from '@/lib/pricing';
import { Trophy, Star, Zap, Target, CheckCircle2 } from 'lucide-react';

type SortKey = 'reputation' | 'points' | 'missions' | 'rate';

export default function LeaderboardPage() {
  const { users } = useStore();
  const [sortBy, setSortBy] = useState<SortKey>('reputation');

  const sorted = [...users].sort((a, b) => {
    switch (sortBy) {
      case 'reputation': return b.reputation.total - a.reputation.total;
      case 'points': return b.pointsBalance - a.pointsBalance;
      case 'missions': return b.missionsCompleted - a.missionsCompleted;
      case 'rate': return b.completionRate - a.completionRate;
    }
  });

  const sortOptions: { key: SortKey; label: string; icon: React.ElementType }[] = [
    { key: 'reputation', label: 'Reputation', icon: Star },
    { key: 'points', label: 'Points', icon: Zap },
    { key: 'missions', label: 'Missions', icon: Target },
    { key: 'rate', label: 'Completion Rate', icon: CheckCircle2 },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-500">Top contributors in the mission marketplace</p>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-2">
        {sortOptions.map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                sortBy === opt.key ? 'bg-violet-100 text-violet-700' : 'bg-white text-gray-500 hover:bg-gray-50'
              )}
            >
              <Icon className="h-4 w-4" />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-4">
        {sorted.slice(0, 3).map((user, i) => {
          const levelInfo = getLevelInfo(user.reputation.total);
          const medals = ['bg-amber-400', 'bg-gray-300', 'bg-orange-400'];
          return (
            <div key={user.id} className={cn(
              'flex flex-col items-center rounded-xl border border-gray-200 bg-white p-5',
              i === 0 && 'ring-2 ring-amber-300'
            )}>
              <div className={cn('mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white', medals[i])}>
                {i + 1}
              </div>
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold text-white">
                {getInitials(user.name)}
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.title}</div>
                <div className="mt-1 inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                  Lv.{levelInfo.level} {levelInfo.name}
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="text-lg font-bold text-violet-600">
                  {sortBy === 'reputation' && formatPoints(user.reputation.total)}
                  {sortBy === 'points' && formatPoints(user.pointsBalance)}
                  {sortBy === 'missions' && user.missionsCompleted}
                  {sortBy === 'rate' && `${Math.round(user.completionRate * 100)}%`}
                </div>
                <div className="text-xs text-gray-400">
                  {sortBy === 'reputation' && 'reputation'}
                  {sortBy === 'points' && 'points'}
                  {sortBy === 'missions' && 'missions'}
                  {sortBy === 'rate' && 'rate'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3">Rank</th>
              <th className="px-5 py-3">Contributor</th>
              <th className="px-5 py-3 text-right">Reputation</th>
              <th className="px-5 py-3 text-right">Points</th>
              <th className="px-5 py-3 text-right">Missions</th>
              <th className="px-5 py-3 text-right">Rate</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((user, i) => {
              const levelInfo = getLevelInfo(user.reputation.total);
              return (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <span className="text-sm font-bold text-gray-400">#{i + 1}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-400">{user.department} &middot; {levelInfo.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-semibold text-violet-600">{formatPoints(user.reputation.total)}</td>
                  <td className="px-5 py-3 text-right text-sm text-gray-700">{formatPoints(user.pointsBalance)}</td>
                  <td className="px-5 py-3 text-right text-sm text-gray-700">{user.missionsCompleted}</td>
                  <td className="px-5 py-3 text-right text-sm text-gray-700">{Math.round(user.completionRate * 100)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
