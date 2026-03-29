'use client';

import { useStore } from '@/lib/store';
import { formatPoints, formatDate, getInitials, statusConfig, categoryConfig } from '@/lib/utils';
import { getLevelInfo } from '@/lib/pricing';
import Link from 'next/link';
import { Zap, Trophy, Target, CheckCircle2, Clock, Star } from 'lucide-react';

export default function ProfilePage() {
  const { getCurrentUser, missions, getTransactionsByUser } = useStore();
  const user = getCurrentUser();
  const txs = getTransactionsByUser(user.id);
  const levelInfo = getLevelInfo(user.reputation.total);

  const userMissions = {
    created: missions.filter(m => m.creatorId === user.id),
    solved: missions.filter(m => m.solverId === user.id),
    validated: missions.filter(m => m.validatorId === user.id),
  };

  const repBreakdown = [
    { label: 'Impact', value: user.reputation.impact, weight: '40%', color: 'bg-violet-500' },
    { label: 'Execution', value: user.reputation.execution, weight: '30%', color: 'bg-blue-500' },
    { label: 'Collaboration', value: user.reputation.collaboration, weight: '20%', color: 'bg-emerald-500' },
    { label: 'Growth', value: user.reputation.growth, weight: '10%', color: 'bg-amber-500' },
  ];
  const maxRep = Math.max(...repBreakdown.map(r => r.value), 1);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start gap-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-bold text-white">
          {getInitials(user.name)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.title} &middot; {user.department}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.roles.map(r => (
              <span key={r} className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium capitalize text-violet-700">{r}</span>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-400">Member since {formatDate(user.joinedAt)}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-2xl font-bold text-violet-600">
            <Zap className="h-6 w-6" /> {formatPoints(user.pointsBalance)}
          </div>
          <p className="text-xs text-gray-500">points balance</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Reputation */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Reputation Score</h2>
              <span className="text-2xl font-bold text-violet-600">{formatPoints(user.reputation.total)}</span>
            </div>

            {/* Level progress */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  <Star className="mr-1 inline h-4 w-4 text-amber-500" />
                  Level {levelInfo.level}: {levelInfo.name}
                </span>
                <span className="text-gray-500">
                  {formatPoints(user.reputation.total)} / {formatPoints(levelInfo.nextThreshold)}
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                  style={{ width: `${Math.round(levelInfo.progress * 100)}%` }}
                />
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="space-y-3">
              {repBreakdown.map(r => (
                <div key={r.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-600">{r.label} <span className="text-gray-400">({r.weight})</span></span>
                    <span className="font-semibold text-gray-900">{formatPoints(r.value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className={`h-2 rounded-full ${r.color}`} style={{ width: `${(r.value / maxRep) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission History */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Mission History</h2>
            <div className="mb-4 flex gap-4 border-b border-gray-100">
              <TabLabel label="Solved" count={userMissions.solved.length} />
              <TabLabel label="Created" count={userMissions.created.length} />
              <TabLabel label="Validated" count={userMissions.validated.length} />
            </div>
            <div className="space-y-2">
              {[...userMissions.solved, ...userMissions.created].slice(0, 8).map(m => {
                const stat = statusConfig[m.status];
                const cat = categoryConfig[m.category];
                return (
                  <Link key={m.id} href={`/missions/${m.id}`} className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-gray-900">{m.title}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                        <span className={`${cat.color}`}>{cat.label}</span>
                        <span>&middot;</span>
                        <span>{formatDate(m.createdAt)}</span>
                      </div>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <span className="text-xs font-medium text-violet-600">{formatPoints(m.dynamicReward)} pts</span>
                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${stat.color} ${stat.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${stat.dot}`} />
                        {stat.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick stats */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Activity</h3>
            <div className="space-y-2">
              <QuickStat icon={Target} label="Missions Created" value={user.missionsCreated} />
              <QuickStat icon={CheckCircle2} label="Missions Solved" value={user.missionsCompleted} />
              <QuickStat icon={Clock} label="Missions Validated" value={user.missionsValidated} />
              <QuickStat icon={Trophy} label="Completion Rate" value={`${Math.round(user.completionRate * 100)}%`} />
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {user.skills.map(s => (
                <span key={s} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">{s}</span>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Badges</h3>
            {user.badges.length === 0 ? (
              <p className="text-sm text-gray-400">No badges yet</p>
            ) : (
              <div className="space-y-2">
                {user.badges.map(b => (
                  <div key={b.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-2.5">
                    <span className="text-xl">{b.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{b.name}</div>
                      <div className="text-xs text-gray-400">{b.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Points History */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Recent Points</h3>
            {txs.length === 0 ? (
              <p className="text-sm text-gray-400">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {txs.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-gray-600">{t.description}</span>
                    <span className={`ml-2 whitespace-nowrap font-medium ${t.type === 'bonus' ? 'text-emerald-600' : 'text-violet-600'}`}>
                      +{t.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabLabel({ label, count }: { label: string; count: number }) {
  return (
    <span className="border-b-2 border-violet-600 pb-2 text-sm font-medium text-violet-600">
      {label} ({count})
    </span>
  );
}

function QuickStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="flex items-center gap-2 text-gray-500">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
