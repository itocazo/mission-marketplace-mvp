const BASE_POINTS_PER_HOUR = 10;

export function calculateBaseReward(
  estimatedHours: number,
  complexity: number,
  urgency: number,
  strategicImportance: number,
  avgSolverCompletionRate: number = 0.85
): number {
  const difficultyAdjustment = avgSolverCompletionRate > 0.9
    ? Math.min(0.2, (avgSolverCompletionRate - 0.9) * 2)
    : 0;
  const ratePerHour = BASE_POINTS_PER_HOUR * complexity * urgency * strategicImportance * (1 - difficultyAdjustment);
  return Math.round(ratePerHour * estimatedHours);
}

export function calculateDynamicReward(
  baseReward: number,
  deadline: string,
  qualifiedSolverRatio: number = 0.6,
  alpha: number = 0.15,
  beta: number = 0.7
): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const createdDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const totalDuration = deadlineDate.getTime() - createdDate.getTime();
  const elapsed = now.getTime() - createdDate.getTime();
  const tElapsed = Math.max(0, Math.min(1, elapsed / totalDuration));

  const dynamicMultiplier = 1 + alpha * tElapsed * (1 - beta * qualifiedSolverRatio);
  const dynamic = Math.round(baseReward * dynamicMultiplier);

  const floor = Math.round(baseReward * 0.75);
  const ceiling = Math.round(baseReward * 1.5);
  return Math.max(floor, Math.min(ceiling, dynamic));
}

export function getPointsPerHour(
  complexity: number,
  urgency: number,
  strategicImportance: number
): number {
  return Math.round(BASE_POINTS_PER_HOUR * complexity * urgency * strategicImportance * 100) / 100;
}

export function getLevelInfo(reputation: number): { level: number; name: string; progress: number; nextThreshold: number } {
  const levels = [
    { threshold: 0, name: 'Novice' },
    { threshold: 500, name: 'Contributor' },
    { threshold: 2000, name: 'Expert' },
    { threshold: 5000, name: 'Master' },
    { threshold: 10000, name: 'Architect' },
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (reputation >= levels[i].threshold) {
      const nextThreshold = i < levels.length - 1 ? levels[i + 1].threshold : levels[i].threshold * 2;
      const progress = (reputation - levels[i].threshold) / (nextThreshold - levels[i].threshold);
      return { level: i + 1, name: levels[i].name, progress: Math.min(1, progress), nextThreshold };
    }
  }
  return { level: 1, name: 'Novice', progress: 0, nextThreshold: 500 };
}
