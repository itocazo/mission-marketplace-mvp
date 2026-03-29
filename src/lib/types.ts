export type UserRole = 'creator' | 'solver' | 'validator' | 'curator';
export type MissionCategory = 'strategic' | 'operational' | 'exploratory';
export type MissionStatus = 'open' | 'in_progress' | 'under_review' | 'revision_requested' | 'completed';
export type RewardModel = 'fixed' | 'auction' | 'lottery';

export interface User {
  id: string;
  name: string;
  avatar: string;
  title: string;
  department: string;
  roles: UserRole[];
  skills: string[];
  reputation: ReputationScore;
  level: number;
  levelName: string;
  pointsBalance: number;
  badges: Badge[];
  joinedAt: string;
  completionRate: number;
  missionsCompleted: number;
  missionsCreated: number;
  missionsValidated: number;
}

export interface ReputationScore {
  total: number;
  impact: number;
  execution: number;
  collaboration: number;
  growth: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  successCriteria: string[];
  category: MissionCategory;
  rewardModel: RewardModel;
  estimatedHours: number;
  deadline: string;
  requiredSkills: string[];
  complexity: number;
  urgency: number;
  strategicImportance: number;
  baseReward: number;
  dynamicReward: number;
  status: MissionStatus;
  creatorId: string;
  solverId: string | null;
  validatorId: string | null;
  applicants: Application[];
  activityLog: ActivityEntry[];
  createdAt: string;
  submittedAt: string | null;
  completedAt: string | null;
}

export interface Application {
  userId: string;
  proposal: string;
  bidAmount?: number;
  appliedAt: string;
}

export interface ActivityEntry {
  id: string;
  type: 'created' | 'applied' | 'assigned' | 'submitted' | 'approved' | 'revision_requested' | 'rejected' | 'completed' | 'comment';
  userId: string;
  message: string;
  timestamp: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent' | 'bonus';
  missionId: string;
  description: string;
  timestamp: string;
}
