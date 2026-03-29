'use client';

import Link from 'next/link';
import { Mission } from '@/lib/types';
import { useStore } from '@/lib/store';
import { categoryConfig, statusConfig, formatPoints, daysUntil, getInitials, cn } from '@/lib/utils';
import { Clock, Users, Zap, Flame } from 'lucide-react';

export default function MissionCard({ mission }: { mission: Mission }) {
  const getUserById = useStore(s => s.getUserById);
  const creator = getUserById(mission.creatorId);
  const cat = categoryConfig[mission.category];
  const stat = statusConfig[mission.status];
  const days = daysUntil(mission.deadline);
  const isUrgent = days <= 7 && days > 0 && mission.status !== 'completed';
  const isOverdue = days <= 0 && mission.status !== 'completed';
  const isHighValue = mission.dynamicReward >= 3000;
  const isHot = mission.applicants.length >= 2 && mission.status === 'open';

  return (
    <Link
      href={`/missions/${mission.id}`}
      className={cn(
        'group flex flex-col rounded-xl border bg-white p-5 transition-all hover:shadow-md',
        isOverdue ? 'border-red-200 hover:border-red-300' :
        isUrgent ? 'border-amber-200 hover:border-amber-300' :
        'border-gray-200 hover:border-violet-300'
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color} ${cat.bg}`}>
            {cat.label}
          </span>
          {isHot && (
            <span className="flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
              <Flame className="h-3 w-3" /> Hot
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${stat.dot}`} />
          <span className={`text-xs font-medium ${stat.color}`}>{stat.label}</span>
        </div>
      </div>

      <h3 className="mb-2 text-base font-semibold text-gray-900 group-hover:text-violet-700 line-clamp-2">
        {mission.title}
      </h3>
      <p className="mb-3 text-sm leading-relaxed text-gray-500 line-clamp-2">{mission.description}</p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {mission.requiredSkills.slice(0, 3).map(skill => (
          <span key={skill} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{skill}</span>
        ))}
        {mission.requiredSkills.length > 3 && (
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-400">+{mission.requiredSkills.length - 3}</span>
        )}
      </div>

      {/* Reward banner for high-value missions */}
      {isHighValue && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-50 to-indigo-50 px-3 py-2">
          <Zap className="h-4 w-4 text-violet-600" />
          <span className="text-sm font-bold text-violet-700">{formatPoints(mission.dynamicReward)} pts</span>
          <span className="text-xs text-violet-400">high value</span>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {!isHighValue && (
            <span className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-violet-500" />
              <span className="font-semibold text-violet-600">{formatPoints(mission.dynamicReward)}</span>
            </span>
          )}
          <span className={cn(
            'flex items-center gap-1',
            isOverdue ? 'font-semibold text-red-600' : isUrgent ? 'font-semibold text-amber-600' : ''
          )}>
            <Clock className={cn('h-3.5 w-3.5', isOverdue ? 'text-red-500' : isUrgent ? 'text-amber-500' : '')} />
            {isOverdue ? 'Overdue' : `${days}d left`}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {mission.applicants.length}
          </span>
        </div>
        {creator && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600" title={creator.name}>
            {getInitials(creator.name)}
          </div>
        )}
      </div>
    </Link>
  );
}
