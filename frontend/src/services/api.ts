import type { 
  Opportunity, 
  ResumeVersion, 
  ApplicationItem, 
  DelegationRecord, 
  AuditEventRecord, 
  UserProfile, 
  SecurityEvent 
} from '../types';
import { 
  mockOpportunities, 
  mockApplications, 
  mockDelegations, 
  mockAuditEvents, 
  mockResumes, 
  mockUser, 
  mockSecurityViolation 
} from './mockData';

const API_BASE_URL = 'http://localhost:8000/api';

export const apiService = {
  // --- User Profile ---
  async getMe(): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using fallback mock user.');
      return mockUser;
    }
  },

  // --- Opportunities ---
  async getOpportunities(): Promise<Opportunity[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/opportunities`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Backend offline');
      const data = await res.json();
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        company: item.company,
        type: item.type === 'job' ? 'Job' : item.type === 'internship' ? 'Internship' : item.type === 'hackathon' ? 'Hackathon' : 'Competition',
        location: item.location,
        isRemote: item.is_remote,
        salaryRange: item.salary_range,
        deadline: new Date(item.deadline).toLocaleDateString(),
        postedDate: 'Recently',
        matchScore: 94,
        atsScore: 91,
        skillScore: 96,
        eligibilityScore: 100,
        skills: item.requirements || [],
        description: item.description,
        requirements: item.requirements || [],
        responsibilities: [],
        eligibility: 'Open',
        source: 'CareerOS Pipeline',
        applyUrl: item.source_url,
      }));
    } catch (e) {
      console.warn('Backend unavailable, using fallback mock opportunities.');
      return mockOpportunities;
    }
  },

  // --- Matching & Recalculate ---
  async getMatches(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async recalculateRankings(preferences: Record<string, number>): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/ranking/recalculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
        signal: AbortSignal.timeout(2000)
      });
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  // --- Resumes & Tailoring ---
  async getResumes(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/resumes`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async getResumeVersions(resumeId: string): Promise<ResumeVersion[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/resumes/${resumeId}/versions`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Backend offline');
      const data = await res.json();
      return data.map((v: any) => ({
        id: v.id,
        title: v.version_name,
        targetOpportunityId: v.opportunity_id,
        targetCompany: 'Target Company', // Placeholder, will be resolved by the front
        atsScore: v.ats_score || 85,
        lastUpdated: new Date(v.created_at).toLocaleDateString(),
        isBaseline: false,
        diffSummary: v.diff_summary || { added: [], modified: [], removed: [] }
      }));
    } catch (e) {
      return mockResumes.filter(r => !r.isBaseline);
    }
  },

  async tailorResume(opportunityId: string, resumeId?: string): Promise<ResumeVersion> {
    try {
      const res = await fetch(`${API_BASE_URL}/resumes/tailor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: opportunityId, resume_id: resumeId }),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) throw new Error('Backend offline');
      const v = await res.json();
      return {
        id: v.id,
        title: v.version_name,
        targetOpportunityId: v.opportunity_id,
        targetCompany: 'Company',
        atsScore: v.ats_score || 85,
        lastUpdated: new Date(v.created_at).toLocaleDateString(),
        isBaseline: false,
        diffSummary: v.diff_summary || { added: [], modified: [], removed: [] }
      };
    } catch (e) {
      throw new Error('Tailoring failed');
    }
  },

  // --- Applications ---
  async getApplications(): Promise<ApplicationItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Backend offline');
      const data = await res.json();
      return data.map((item: any) => ({
        id: item.id,
        opportunityId: item.opportunity_id,
        company: item.opportunity?.company || 'Company',
        role: item.opportunity?.title || 'Role',
        stage: item.status === 'approval_required' ? 'Approval Required' : item.status === 'submitted' ? 'Submitted' : item.status === 'ready' ? 'Application Ready' : 'Discovered',
        matchScore: 94,
        resumeVersion: item.resume_version?.version_name || 'Mohit_Baseline_Resume.pdf',
        lastAction: item.status === 'approval_required' ? 'ArmorIQ intercepted submit_application() — Waiting for Human Approval' : 'Action completed.',
        requiresApproval: item.status === 'approval_required',
        preparedAnswers: item.prepared_answers ? Object.entries(item.prepared_answers).map(([q, a]) => ({ question: q, answer: a as string })) : []
      }));
    } catch (e) {
      return mockApplications;
    }
  },

  async prepareApplication(opportunityId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: opportunityId }),
        signal: AbortSignal.timeout(2000)
      });
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch (e) {
      throw new Error('Application preparation failed');
    }
  },

  async approveApplication(applicationId: string, approved: boolean): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
        signal: AbortSignal.timeout(2000)
      });
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch (e) {
      throw new Error('Application approval failed');
    }
  },

  // --- Security & Audit ---
  async getDelegations(): Promise<DelegationRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/delegations`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Backend offline');
      const data = await res.json();
      return data.map((d: any) => ({
        id: d.id,
        planId: 'PLAN-' + d.plan_id.substring(0, 8).toUpperCase(),
        parentAgent: d.parent_agent,
        childAgent: d.child_agent,
        allowedScopes: d.allowed_scopes || [],
        restrictedScopes: ['submit_application', 'send_email'],
        token: d.delegation_token,
        expiresAt: d.expires_at,
        createdAt: 'Recently'
      }));
    } catch (e) {
      return mockDelegations;
    }
  },

  async getAuditEvents(): Promise<AuditEventRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/audit`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Backend offline');
      const data = await res.json();
      return data.map((a: any) => ({
        id: a.id,
        timestamp: new Date(a.timestamp).toLocaleTimeString(),
        agentName: a.agent_name,
        parentAgent: 'Commander',
        toolName: a.tool_name,
        mcpServer: a.tool_name.includes('job') || a.tool_name.includes('opp') ? 'opportunity-mcp' : a.tool_name.includes('resume') ? 'resume-mcp' : 'application-mcp',
        arguments: a.arguments || {},
        decision: a.decision,
        reason: a.reason,
        delegationId: a.delegation_id || 'del-active',
        planId: 'PLAN-' + (a.plan_id || 'active').substring(0, 8).toUpperCase()
      }));
    } catch (e) {
      return mockAuditEvents;
    }
  },

  async getSecurityEvents(): Promise<SecurityEvent[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/security/events`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Backend offline');
      const data = await res.json();
      return data.map((e: any) => ({
        id: e.id,
        timestamp: new Date(e.timestamp).toLocaleTimeString(),
        agent: e.agent,
        attemptedAction: e.tool + '()',
        delegatedScope: ['prepare_application', 'get_application_questions', 'draft_answers'],
        decision: e.decision,
        reason: e.reason,
        planId: 'PLAN-' + (e.plan_id || 'active').substring(0, 8).toUpperCase(),
        delegationId: 'del-active'
      }));
    } catch (e) {
      return [mockSecurityViolation];
    }
  }
};
