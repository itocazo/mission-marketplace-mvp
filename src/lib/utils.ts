import { MissionCategory, MissionStatus } from './types';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function formatPoints(points: number): string {
  if (points >= 1000) return `${(points / 1000).toFixed(1)}k`;
  return points.toString();
}

export function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export const categoryConfig: Record<MissionCategory, { label: string; color: string; bg: string }> = {
  strategic: { label: 'Strategic', color: 'text-violet-700', bg: 'bg-violet-100' },
  operational: { label: 'Operational', color: 'text-blue-700', bg: 'bg-blue-100' },
  exploratory: { label: 'Exploratory', color: 'text-amber-700', bg: 'bg-amber-100' },
};

export const statusConfig: Record<MissionStatus, { label: string; color: string; bg: string; dot: string }> = {
  open: { label: 'Open', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  in_progress: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  under_review: { label: 'Under Review', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  revision_requested: { label: 'Revision Requested', color: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  completed: { label: 'Completed', color: 'text-violet-700', bg: 'bg-violet-50', dot: 'bg-violet-500' },
};

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}
