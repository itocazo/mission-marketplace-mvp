'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { MissionCategory, MissionStatus } from '@/lib/types';
import MissionCard from '@/components/missions/MissionCard';
import Link from 'next/link';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_FILTERS: { value: MissionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'completed', label: 'Completed' },
];

const CATEGORY_FILTERS: { value: MissionCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'operational', label: 'Operational' },
  { value: 'exploratory', label: 'Exploratory' },
];

export default function MissionsPage() {
  const { missions } = useStore();
  const [statusFilter, setStatusFilter] = useState<MissionStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<MissionCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'reward' | 'deadline'>('newest');

  let filtered = missions;
  if (statusFilter !== 'all') filtered = filtered.filter(m => m.status === statusFilter);
  if (categoryFilter !== 'all') filtered = filtered.filter(m => m.category === categoryFilter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.requiredSkills.some(s => s.toLowerCase().includes(q))
    );
  }

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'reward') return b.dynamicReward - a.dynamicReward;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mission Marketplace</h1>
        <p className="mt-1 text-sm text-gray-500">{missions.length} missions total &middot; {missions.filter(m => m.status === 'open').length} open</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                statusFilter === f.value
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search missions or skills..."
              className="h-9 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as MissionCategory | 'all')}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:border-violet-300 focus:outline-none"
          >
            {CATEGORY_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'newest' | 'reward' | 'deadline')}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:border-violet-300 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="reward">Highest Reward</option>
            <option value="deadline">Closest Deadline</option>
          </select>
        </div>
      </div>

      {/* Mission Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
          <SlidersHorizontal className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No missions match your filters</p>
          <p className="mt-1 text-xs text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(m => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </div>
      )}
    </div>
  );
}
