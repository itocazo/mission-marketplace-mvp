'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Mission, PointTransaction, MissionStatus, Application, ActivityEntry } from './types';
import { SEED_USERS, SEED_MISSIONS, SEED_TRANSACTIONS } from './data';
import { calculateBaseReward, calculateDynamicReward } from './pricing';

interface MarketplaceState {
  currentUserId: string;
  users: User[];
  missions: Mission[];
  transactions: PointTransaction[];

  setCurrentUser: (userId: string) => void;
  getCurrentUser: () => User;
  getUserById: (id: string) => User | undefined;

  createMission: (mission: Omit<Mission, 'id' | 'status' | 'solverId' | 'validatorId' | 'applicants' | 'activityLog' | 'submittedAt' | 'completedAt' | 'dynamicReward'>) => Mission;
  applyToMission: (missionId: string, proposal: string, bidAmount?: number) => void;
  assignSolver: (missionId: string, solverId: string) => void;
  submitWork: (missionId: string) => void;
  approveWork: (missionId: string, feedback: string) => void;
  requestRevision: (missionId: string, feedback: string) => void;
  rejectWork: (missionId: string, feedback: string) => void;

  getMissionsByStatus: (status: MissionStatus) => Mission[];
  getMissionsByCreator: (userId: string) => Mission[];
  getMissionsBySolver: (userId: string) => Mission[];
  getTransactionsByUser: (userId: string) => PointTransaction[];
  resetData: () => void;
}

let missionCounter = 100;
let txCounter = 100;
let activityCounter = 100;

function nextMissionId() { return `m${++missionCounter}`; }
function nextTxId() { return `t${++txCounter}`; }
function nextActivityId() { return `a${++activityCounter}`; }

export const useStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      currentUserId: 'u1',
      users: SEED_USERS,
      missions: SEED_MISSIONS,
      transactions: SEED_TRANSACTIONS,

      setCurrentUser: (userId) => set({ currentUserId: userId }),

      getCurrentUser: () => {
        const state = get();
        return state.users.find(u => u.id === state.currentUserId) ?? SEED_USERS[0];
      },

      getUserById: (id) => get().users.find(u => u.id === id),

      createMission: (data) => {
        const id = nextMissionId();
        const dynamicReward = calculateDynamicReward(data.baseReward, data.deadline);
        const mission: Mission = {
          ...data,
          id,
          dynamicReward,
          status: 'open',
          solverId: null,
          validatorId: null,
          applicants: [],
          activityLog: [{
            id: nextActivityId(),
            type: 'created',
            userId: data.creatorId,
            message: 'Mission posted to marketplace',
            timestamp: new Date().toISOString(),
          }],
          submittedAt: null,
          completedAt: null,
        };
        set(state => ({ missions: [mission, ...state.missions] }));
        return mission;
      },

      applyToMission: (missionId, proposal, bidAmount) => {
        const { currentUserId } = get();
        const application: Application = {
          userId: currentUserId,
          proposal,
          bidAmount,
          appliedAt: new Date().toISOString(),
        };
        const activity: ActivityEntry = {
          id: nextActivityId(),
          type: 'applied',
          userId: currentUserId,
          message: `${get().getCurrentUser().name} submitted application`,
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          missions: state.missions.map(m =>
            m.id === missionId
              ? { ...m, applicants: [...m.applicants, application], activityLog: [...m.activityLog, activity] }
              : m
          ),
        }));
      },

      assignSolver: (missionId, solverId) => {
        const solver = get().getUserById(solverId);
        const validators = get().users.filter(u => u.roles.includes('validator') && u.id !== solverId);
        const validator = validators[0];
        const activity: ActivityEntry = {
          id: nextActivityId(),
          type: 'assigned',
          userId: get().currentUserId,
          message: `${solver?.name} selected as solver`,
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          missions: state.missions.map(m =>
            m.id === missionId
              ? { ...m, status: 'in_progress' as MissionStatus, solverId, validatorId: validator?.id ?? null, activityLog: [...m.activityLog, activity] }
              : m
          ),
        }));
      },

      submitWork: (missionId) => {
        const activity: ActivityEntry = {
          id: nextActivityId(),
          type: 'submitted',
          userId: get().currentUserId,
          message: 'Work submitted for validation',
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          missions: state.missions.map(m =>
            m.id === missionId
              ? { ...m, status: 'under_review' as MissionStatus, submittedAt: new Date().toISOString(), activityLog: [...m.activityLog, activity] }
              : m
          ),
        }));
      },

      approveWork: (missionId, feedback) => {
        const mission = get().missions.find(m => m.id === missionId);
        if (!mission || !mission.solverId) return;

        const now = new Date().toISOString();
        const solverReward = mission.dynamicReward;
        const qualityBonus = Math.round(solverReward * 0.1);
        const validatorReward = Math.round(solverReward * 0.1);
        const creatorReward = Math.round(solverReward * 0.05);

        const newTxs: PointTransaction[] = [
          { id: nextTxId(), userId: mission.solverId, amount: solverReward, type: 'earned', missionId, description: `Completed: ${mission.title}`, timestamp: now },
          { id: nextTxId(), userId: mission.solverId, amount: qualityBonus, type: 'bonus', missionId, description: `Quality bonus for ${mission.title}`, timestamp: now },
        ];
        if (mission.validatorId) {
          newTxs.push({ id: nextTxId(), userId: mission.validatorId, amount: validatorReward, type: 'earned', missionId, description: `Validation: ${mission.title}`, timestamp: now });
        }
        newTxs.push({ id: nextTxId(), userId: mission.creatorId, amount: creatorReward, type: 'earned', missionId, description: `Creator reward: ${mission.title}`, timestamp: now });

        const activity: ActivityEntry = {
          id: nextActivityId(),
          type: 'approved',
          userId: get().currentUserId,
          message: feedback || 'Work approved — excellent quality',
          timestamp: now,
        };
        const completedActivity: ActivityEntry = {
          id: nextActivityId(),
          type: 'completed',
          userId: get().currentUserId,
          message: `Mission completed. ${solverReward + qualityBonus} points distributed to solver.`,
          timestamp: now,
        };

        set(state => ({
          missions: state.missions.map(m =>
            m.id === missionId
              ? { ...m, status: 'completed' as MissionStatus, completedAt: now, activityLog: [...m.activityLog, activity, completedActivity] }
              : m
          ),
          transactions: [...state.transactions, ...newTxs],
          users: state.users.map(u => {
            const userTxs = newTxs.filter(t => t.userId === u.id);
            if (userTxs.length === 0) return u;
            const totalEarned = userTxs.reduce((sum, t) => sum + t.amount, 0);
            const repBonus = Math.round(totalEarned * 0.05);
            return {
              ...u,
              pointsBalance: u.pointsBalance + totalEarned,
              reputation: {
                ...u.reputation,
                total: u.reputation.total + repBonus,
                impact: u.reputation.impact + Math.round(repBonus * 0.4),
                execution: u.reputation.execution + Math.round(repBonus * 0.3),
                collaboration: u.reputation.collaboration + Math.round(repBonus * 0.2),
                growth: u.reputation.growth + Math.round(repBonus * 0.1),
              },
              missionsCompleted: u.id === mission.solverId ? u.missionsCompleted + 1 : u.missionsCompleted,
              missionsValidated: u.id === mission.validatorId ? u.missionsValidated + 1 : u.missionsValidated,
            };
          }),
        }));
      },

      requestRevision: (missionId, feedback) => {
        const activity: ActivityEntry = {
          id: nextActivityId(),
          type: 'revision_requested',
          userId: get().currentUserId,
          message: feedback || 'Revision requested',
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          missions: state.missions.map(m =>
            m.id === missionId
              ? { ...m, status: 'revision_requested' as MissionStatus, activityLog: [...m.activityLog, activity] }
              : m
          ),
        }));
      },

      rejectWork: (missionId, feedback) => {
        const activity: ActivityEntry = {
          id: nextActivityId(),
          type: 'rejected',
          userId: get().currentUserId,
          message: feedback || 'Work rejected',
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          missions: state.missions.map(m =>
            m.id === missionId
              ? { ...m, status: 'open' as MissionStatus, solverId: null, validatorId: null, activityLog: [...m.activityLog, activity] }
              : m
          ),
        }));
      },

      getMissionsByStatus: (status) => get().missions.filter(m => m.status === status),
      getMissionsByCreator: (userId) => get().missions.filter(m => m.creatorId === userId),
      getMissionsBySolver: (userId) => get().missions.filter(m => m.solverId === userId),
      getTransactionsByUser: (userId) => get().transactions.filter(t => t.userId === userId),
      resetData: () => set({ currentUserId: 'u1', users: SEED_USERS, missions: SEED_MISSIONS, transactions: SEED_TRANSACTIONS }),
    }),
    {
      name: 'mission-marketplace',
    }
  )
);
