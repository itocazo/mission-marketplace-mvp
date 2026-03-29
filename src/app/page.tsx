'use client';

import { useStore } from '@/lib/store';
import { formatPoints, categoryConfig, getInitials } from '@/lib/utils';
import MissionCard from '@/components/missions/MissionCard';
import Link from 'next/link';
import {
  Target, CheckCircle2, Clock, Users, Zap,
  ArrowRight, BarChart3, AlertTriangle, Eye,
} from 'lucide-react';

export default function Dashboard() {
  const { missions, users, getCurrentUser, getTransactionsByUser } = useStore();
  const user = getCurrentUser();
  const userTxs = getTransactionsByUser(user.id);

  const openMissions = missions.filter(m => m.status === 'open');
  const inProgress = missions.filter(m => m.status === 'in_progress');
  const completed = missions.filter(m => m.status === 'completed');
  const underReview = missions.filter(m => m.status === 'under_review');

  const totalPointsDistributed = userTxs.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
  const needsReviewByMe = underReview.filter(m => m.validatorId === user.id || m.creatorId === user.id);
  const myInProgress = inProgress.filter(m => m.solverId === user.id);

  const recentMissions = [...missions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const categoryBreakdown = {
    strategic: missions.filter(m => m.category === 'strategic').length,
    operational: missions.filter(m => m.category === 'operational').length,
    exploratory: missions.filter(m => m.category === 'exploratory').length,
  };
  const totalMissions = missions.length || 1;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user.roles.includes('creator') && !user.roles.includes('solver')
              ? 'Track your posted missions and review submissions.'
              : user.roles.includes('solver') && !user.roles.includes('creator')
              ? 'Find missions to solve and grow your reputation.'
              : user.roles.includes('validator')
              ? 'Review submitted work and ensure quality standards.'
              : 'Here\u2019s what\u2019s happening in the mission marketplace today.'}
          </p>
        </div>
      </div>

      {/* Action prompts — tell the user what to do next */}
      {(needsReviewByMe.length > 0 || myInProgress.length > 0 || openMissions.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {needsReviewByMe.length > 0 && (
            <Link href={`/missions/${needsReviewByMe[0].id}`} className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100">
              <Eye className="h-4 w-4" />
              {needsReviewByMe.length} mission{needsReviewByMe.length > 1 ? 's' : ''} awaiting your review
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {myInProgress.length > 0 && (
            <Link href={`/missions/${myInProgress[0].id}`} className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-100">
              <Clock className="h-4 w-4" />
              {myInProgress.length} mission{myInProgress.length > 1 ? 's' : ''} in progress
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {openMissions.length > 0 && user.roles.includes('solver') && (
            <Link href="/missions" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100">
              <Target className="h-4 w-4" />
              {openMissions.length} open missions need solvers
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Target} label="Open Missions" value={openMissions.length} accent="violet" />
        <StatCard icon={Clock} label="In Progress" value={inProgress.length} accent="blue" />
        <StatCard icon={CheckCircle2} label="Completed" value={completed.length} accent="emerald" />
        <StatCard icon={Zap} label="Your Points" value={formatPoints(user.pointsBalance)} accent="amber" />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Missions</h2>
            <Link href="/missions" className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recentMissions.map(m => (
              <MissionCard key={m.id} mission={m} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Personal stats */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Your Stats</h3>
            <div className="space-y-3">
              <MiniStat label="Reputation" value={formatPoints(user.reputation.total)} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Level</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                  Lv.{user.level} {user.levelName}
                </span>
              </div>
              <MiniStat label="Missions Solved" value={user.missionsCompleted} />
              <MiniStat label="Total Earned" value={`${formatPoints(totalPointsDistributed)} pts`} highlight />
              <MiniStat label="Completion Rate" value={`${Math.round(user.completionRate * 100)}%`} />
            </div>
          </div>

          {/* Category breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <BarChart3 className="h-4 w-4 text-gray-400" />
              Mission Categories
            </h3>
            <div className="space-y-3">
              {(Object.keys(categoryBreakdown) as Array<keyof typeof categoryBreakdown>).map(cat => {
                const config = categoryConfig[cat];
                const count = categoryBreakdown[cat];
                const pct = Math.round((count / totalMissions) * 100);
                return (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className={`font-medium ${config.color}`}>{config.label}</span>
                      <span className="text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${cat === 'strategic' ? 'bg-violet-500' : cat === 'operational' ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {underReview.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-amber-800">Awaiting Review</h3>
              {underReview.map(m => (
                <Link key={m.id} href={`/missions/${m.id}`} className="block text-sm text-amber-700 underline hover:text-amber-900">
                  {m.title}
                </Link>
              ))}
            </div>
          )}

          {/* Top Contributors */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Users className="h-4 w-4 text-gray-400" />
              Top Contributors
            </h3>
            <div className="space-y-2">
              {[...users].sort((a, b) => b.reputation.total - a.reputation.total).slice(0, 5).map((u, i) => (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="w-5 text-right text-xs font-bold text-gray-400">#{i + 1}</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-[10px] font-bold text-white">
                    {getInitials(u.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">{u.name}</div>
                  </div>
                  <span className="text-xs font-semibold text-violet-600">{formatPoints(u.reputation.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string | number; accent: string }) {
  const colors: Record<string, string> = {
    violet: 'bg-violet-50 text-violet-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-violet-600' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}
