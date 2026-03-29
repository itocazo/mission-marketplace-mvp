'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { categoryConfig, statusConfig, formatPoints, formatDate, formatDateTime, daysUntil, getInitials, cn } from '@/lib/utils';
import MissionLifecycle from '@/components/missions/MissionLifecycle';
import Link from 'next/link';
import {
  ArrowLeft, Clock, Zap, Users, Calendar, CheckCircle2,
  AlertCircle, MessageSquare, User as UserIcon, Send,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function MissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    missions, getCurrentUser, getUserById,
    applyToMission, assignSolver, submitWork,
    approveWork, requestRevision, rejectWork,
  } = useStore();

  const missionOrNull = missions.find(m => m.id === params.id) ?? null;
  const currentUser = getCurrentUser();

  const [proposal, setProposal] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const toast = useToast(s => s.add);

  if (!missionOrNull) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-3 h-8 w-8 text-gray-300" />
        <p className="text-gray-500">Mission not found</p>
        <Link href="/missions" className="mt-3 text-sm text-violet-600 hover:underline">Back to missions</Link>
      </div>
    );
  }

  const mission = missionOrNull;

  const creator = getUserById(mission.creatorId);
  const solver = mission.solverId ? getUserById(mission.solverId) : null;
  const validator = mission.validatorId ? getUserById(mission.validatorId) : null;
  const cat = categoryConfig[mission.category];
  const stat = statusConfig[mission.status];
  const days = daysUntil(mission.deadline);

  const isCreator = currentUser.id === mission.creatorId;
  const isSolver = currentUser.id === mission.solverId;
  const isValidator = currentUser.id === mission.validatorId || currentUser.roles.includes('validator');
  const hasApplied = mission.applicants.some(a => a.userId === currentUser.id);

  function handleApply() {
    if (!proposal.trim()) return;
    applyToMission(mission.id, proposal);
    setProposal('');
    setShowApplyForm(false);
    toast('Application submitted successfully!');
  }

  function handleAssign(solverId: string) {
    const solver = getUserById(solverId);
    assignSolver(mission.id, solverId);
    toast(`${solver?.name ?? 'Solver'} assigned to mission`);
  }

  function handleSubmit() {
    submitWork(mission.id);
    toast('Work submitted for review!');
  }

  function handleApprove() {
    approveWork(mission.id, feedback || 'Work approved — excellent quality');
    setFeedback('');
    toast(`Mission approved! ${formatPoints(mission.dynamicReward)} points distributed.`);
  }

  function handleRequestRevision() {
    if (!feedback.trim()) return;
    requestRevision(mission.id, feedback);
    setFeedback('');
    toast('Revision requested — solver notified.', 'info');
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/missions" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Missions
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color} ${cat.bg}`}>{cat.label}</span>
            <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${stat.color} ${stat.bg}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${stat.dot}`} />
              {stat.label}
            </span>
            {mission.rewardModel !== 'fixed' && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {mission.rewardModel === 'auction' ? 'Auction' : 'Lottery'}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{mission.title}</h1>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-2xl font-bold text-violet-600">
            <Zap className="h-6 w-6" />
            {formatPoints(mission.dynamicReward)} pts
          </div>
          <div className="text-xs text-gray-500">Base: {formatPoints(mission.baseReward)} pts</div>
        </div>
      </div>

      {/* Lifecycle */}
      <div className="mb-8 flex justify-center rounded-xl border border-gray-200 bg-white p-6">
        <MissionLifecycle status={mission.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Section title="Description">
            <p className="text-sm leading-relaxed text-gray-600">{mission.description}</p>
          </Section>

          {/* Success Criteria */}
          <Section title="Success Criteria">
            <ul className="space-y-2">
              {mission.successCriteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {c}
                </li>
              ))}
            </ul>
          </Section>

          {/* Actions */}
          {mission.status === 'open' && !isCreator && !hasApplied && (
            <Section title="Apply to Solve">
              {!showApplyForm ? (
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Apply for This Mission
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={proposal}
                    onChange={e => setProposal(e.target.value)}
                    rows={4}
                    placeholder="Describe your approach, relevant experience, and estimated timeline..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleApply} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
                      <Send className="mr-1.5 inline h-4 w-4" /> Submit Application
                    </button>
                    <button onClick={() => setShowApplyForm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </Section>
          )}

          {hasApplied && mission.status === 'open' && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              You have applied to this mission. Waiting for creator to select a solver.
            </div>
          )}

          {/* Creator: Select solver */}
          {isCreator && mission.status === 'open' && mission.applicants.length > 0 && (
            <Section title={`Applicants (${mission.applicants.length})`}>
              <div className="space-y-3">
                {mission.applicants.map(app => {
                  const applicant = getUserById(app.userId);
                  if (!applicant) return null;
                  return (
                    <div key={app.userId} className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white">
                            {getInitials(applicant.name)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                            <div className="text-xs text-gray-500">{applicant.title} &middot; {applicant.levelName}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssign(app.userId)}
                          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
                        >
                          Select Solver
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{app.proposal}</p>
                      <div className="mt-2 flex gap-3 text-xs text-gray-400">
                        <span>Completion rate: {Math.round(applicant.completionRate * 100)}%</span>
                        <span>Reputation: {formatPoints(applicant.reputation.total)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Solver: Submit work */}
          {isSolver && (mission.status === 'in_progress' || mission.status === 'revision_requested') && (
            <Section title="Submit Your Work">
              <p className="mb-3 text-sm text-gray-500">When your work is complete and meets all success criteria, submit it for validation.</p>
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
              >
                Submit for Review
              </button>
            </Section>
          )}

          {/* Validator: Review */}
          {(isValidator || isCreator) && mission.status === 'under_review' && (
            <Section title="Review & Validate">
              <p className="mb-3 text-sm text-gray-500">Review the submitted work against the success criteria above.</p>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                rows={3}
                placeholder="Provide feedback..."
                className="mb-3 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-300 focus:outline-none"
              />
              <div className="flex gap-2">
                <button onClick={handleApprove} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  Approve
                </button>
                <button onClick={handleRequestRevision} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
                  Request Revision
                </button>
              </div>
            </Section>
          )}

          {/* Completed */}
          {mission.status === 'completed' && (
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-5">
              <div className="flex items-center gap-2 text-violet-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Mission Completed</span>
              </div>
              <p className="mt-1 text-sm text-violet-600">
                {formatPoints(mission.dynamicReward)} points distributed. Completed on {formatDate(mission.completedAt!)}.
              </p>
            </div>
          )}

          {/* Activity Feed */}
          <Section title="Activity">
            <div className="space-y-3">
              {[...mission.activityLog].reverse().map(entry => {
                const entryUser = getUserById(entry.userId);
                return (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                      {entryUser ? getInitials(entryUser.name) : '?'}
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">{entry.message}</p>
                      <p className="text-xs text-gray-400">{formatDateTime(entry.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <InfoCard title="Details">
            <InfoRow icon={Clock} label="Estimated" value={`${mission.estimatedHours}h`} />
            <InfoRow icon={Calendar} label="Deadline" value={formatDate(mission.deadline)} />
            <InfoRow icon={Zap} label="Reward" value={`${formatPoints(mission.dynamicReward)} pts`} highlight />
            <InfoRow icon={Users} label="Applicants" value={String(mission.applicants.length)} />
            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 space-y-1">
              <div>Complexity: <strong>{mission.complexity}x</strong></div>
              <div>Urgency: <strong>{mission.urgency}x</strong></div>
              <div>Strategic: <strong>{mission.strategicImportance}x</strong></div>
            </div>
          </InfoCard>

          <InfoCard title="People">
            <PersonRow label="Creator" user={creator} />
            {solver && <PersonRow label="Solver" user={solver} />}
            {validator && <PersonRow label="Validator" user={validator} />}
          </InfoCard>

          <InfoCard title="Required Skills">
            <div className="flex flex-wrap gap-1.5">
              {mission.requiredSkills.map(s => (
                <span key={s} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
              ))}
            </div>
          </InfoCard>

          {days > 0 && mission.status !== 'completed' && (
            <div className={cn(
              'rounded-xl p-4 text-center',
              days <= 7 ? 'border border-red-200 bg-red-50' : 'border border-gray-200 bg-white'
            )}>
              <div className={cn('text-2xl font-bold', days <= 7 ? 'text-red-600' : 'text-gray-900')}>{days}</div>
              <div className="text-xs text-gray-500">days remaining</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, highlight }: { icon: React.ElementType; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="flex items-center gap-2 text-gray-500">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className={cn('font-medium', highlight ? 'text-violet-600' : 'text-gray-900')}>{value}</span>
    </div>
  );
}

function PersonRow({ label, user }: { label: string; user: ReturnType<typeof import('@/lib/store').useStore.getState>['users'][0] | undefined }) {
  if (!user) return null;
  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-[10px] font-bold text-white">
        {getInitials(user.name)}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-900">{user.name}</div>
        <div className="text-xs text-gray-400">{label} &middot; {user.levelName}</div>
      </div>
    </div>
  );
}
