import { create } from 'zustand';
import type { DelegationRecord, AuditEventRecord, SecurityEvent } from '../types';
import { mockDelegations, mockAuditEvents, mockSecurityViolation } from '../services/mockData';

interface SecurityStoreState {
  delegations: DelegationRecord[];
  auditEvents: AuditEventRecord[];
  activeViolation: SecurityEvent | null;
  isViolationModalOpen: boolean;
  openViolationModal: (violation?: SecurityEvent) => void;
  closeViolationModal: () => void;
  approveViolation: (eventId: string) => void;
}

export const useSecurityStore = create<SecurityStoreState>((set) => ({
  delegations: mockDelegations,
  auditEvents: mockAuditEvents,
  activeViolation: mockSecurityViolation,
  isViolationModalOpen: false,
  openViolationModal: (violation) =>
    set({
      activeViolation: violation || mockSecurityViolation,
      isViolationModalOpen: true,
    }),
  closeViolationModal: () => set({ isViolationModalOpen: false }),
  approveViolation: (eventId) =>
    set((state) => {
      const updatedAudit = state.auditEvents.map((evt) =>
        evt.id === eventId
          ? {
              ...evt,
              decision: 'ALLOW' as const,
              reason: 'Human authorization granted by Mohit Upraity.',
            }
          : evt
      );
      return {
        auditEvents: updatedAudit,
        isViolationModalOpen: false,
        activeViolation: null,
      };
    }),
}));
