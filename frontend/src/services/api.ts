import { Opportunity, MatchScore, ResumeVersion, ApplicationItem, DelegationRecord, AuditEventRecord } from '../types';
import { mockOpportunities, mockApplications, mockDelegations, mockAuditEvents, mockResumes } from './mockData';

const API_BASE_URL = 'http://localhost:8000/api';

export const apiService = {
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

  async getApplications(): Promise<ApplicationItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Backend offline');
      const data = await res.json();
      return data;
    } catch (e) {
      return mockApplications;
    }
  },

  async getDelegations(): Promise<DelegationRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/delegations`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch (e) {
      return mockDelegations;
    }
  },

  async getAuditEvents(): Promise<AuditEventRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/audit`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch (e) {
      return mockAuditEvents;
    }
  },
};
