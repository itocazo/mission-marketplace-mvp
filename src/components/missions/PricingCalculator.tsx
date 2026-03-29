'use client';

import { calculateBaseReward, getPointsPerHour } from '@/lib/pricing';
import { Zap } from 'lucide-react';

interface Props {
  estimatedHours: number;
  complexity: number;
  urgency: number;
  strategicImportance: number;
}

export default function PricingCalculator({ estimatedHours, complexity, urgency, strategicImportance }: Props) {
  const pointsPerHour = getPointsPerHour(complexity, urgency, strategicImportance);
  const baseReward = calculateBaseReward(estimatedHours, complexity, urgency, strategicImportance);
  const qualityBonus = Math.round(baseReward * 0.1);
  const validatorReward = Math.round(baseReward * 0.1);
  const creatorReward = Math.round(baseReward * 0.05);

  return (
    <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-5 w-5 text-violet-600" />
        <h3 className="text-sm font-semibold text-violet-900">Dynamic Pricing Preview</h3>
      </div>

      <div className="mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Base rate</span>
          <span className="font-mono text-gray-900">{pointsPerHour} pts/hr</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Formula</span>
          <span className="font-mono text-xs text-gray-500">10 x {complexity} x {urgency} x {strategicImportance}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Estimated hours</span>
          <span className="font-mono text-gray-900">{estimatedHours}h</span>
        </div>
      </div>

      <div className="border-t border-violet-200 pt-3">
        <div className="mb-2 flex justify-between text-base">
          <span className="font-semibold text-violet-900">Solver Reward</span>
          <span className="font-bold text-violet-600">{baseReward.toLocaleString()} pts</span>
        </div>
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>+ Quality bonus (10%)</span>
            <span className="text-emerald-600">+{qualityBonus}</span>
          </div>
          <div className="flex justify-between">
            <span>Validator reward (10%)</span>
            <span>{validatorReward}</span>
          </div>
          <div className="flex justify-between">
            <span>Creator reward (5%)</span>
            <span>{creatorReward}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
