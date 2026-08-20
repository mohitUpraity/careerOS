import { create } from 'zustand';
import type { AgentNodeData, AgentActivityEvent } from '../types';
import { mockAgents, mockLiveActivities } from '../services/mockData';

interface AgentStoreState {
  agents: AgentNodeData[];
  activities: AgentActivityEvent[];
  isDemoRunning: boolean;
  activePlanId: string;
  addActivity: (activity: Omit<AgentActivityEvent, 'id' | 'timestamp'>) => void;
  updateAgentStatus: (agentId: string, status: AgentNodeData['status'], task?: string) => void;
  setDemoRunning: (running: boolean) => void;
}

export const useAgentStore = create<AgentStoreState>((set) => ({
  agents: mockAgents,
  activities: mockLiveActivities,
  isDemoRunning: false,
  activePlanId: 'PLAN-8F91',
  addActivity: (activity) =>
    set((state) => {
      const newEvent: AgentActivityEvent = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        ...activity,
      };
      return { activities: [newEvent, ...state.activities] };
    }),
  updateAgentStatus: (agentId, status, task) =>
    set((state) => ({
      agents: state.agents.map((ag) =>
        ag.id === agentId ? { ...ag, status, ...(task ? { currentTask: task } : {}) } : ag
      ),
    })),
  setDemoRunning: (running) => set({ isDemoRunning: running }),
}));
