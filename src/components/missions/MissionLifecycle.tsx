'use client';

import { MissionStatus } from '@/lib/types';
import { Check } from 'lucide-react';

const STEPS: { status: MissionStatus; label: string }[] = [
  { status: 'open', label: 'Open' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'under_review', label: 'Under Review' },
  { status: 'completed', label: 'Completed' },
];

function stepIndex(status: MissionStatus): number {
  if (status === 'revision_requested') return 2;
  const i = STEPS.findIndex(s => s.status === status);
  return i >= 0 ? i : 0;
}

export default function MissionLifecycle({ status }: { status: MissionStatus }) {
  const current = stepIndex(status);

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.status} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  done
                    ? 'bg-violet-600 text-white'
                    : active
                    ? 'border-2 border-violet-600 bg-violet-50 text-violet-600'
                    : 'border-2 border-gray-200 bg-white text-gray-400'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`mt-1 text-[10px] font-medium ${active ? 'text-violet-600' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                {status === 'revision_requested' && i === 2 ? 'Revision' : step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mb-4 h-0.5 w-8 sm:w-12 ${i < current ? 'bg-violet-600' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
