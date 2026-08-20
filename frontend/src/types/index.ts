export type AgentStatus = 'IDLE' | 'RUNNING' | 'WAITING' | 'BLOCKED' | 'COMPLETED';

export type PolicyDecision = 'ALLOW' | 'BLOCK' | 'PENDING';

export interface UserProfile {
  name: string;
  headline: string;
  email: string;
  location: string;
  completeness: number;
  availability: 'Available' | 'Active Search' | 'Passive';
  avatarUrl: string;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  type: 'Job' | 'Internship' | 'Hackathon' | 'Competition';
  location: string;
  isRemote: boolean;
  salaryRange?: string;
  deadline: string;
  postedDate: string;
  matchScore: number;
  atsScore: number;
  skillScore: number;
  eligibilityScore: number;
  skills: string[];
  partialSkills?: string[];
  missingSkills?: string[];
  description: string;
  requirements: string[];
  responsibilities: string[];
  eligibility: string;
  source: string;
  applyUrl: string;
}

export interface ATSAnalysis {
  opportunityId: string;
  overallScore: number;
  keywordCoverage: number;
  semanticMatch: number;
  experienceEvidence: number;
  projectEvidence: number;
  formattingScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  explanations: string[];
}

export interface ResumeVersion {
  id: string;
  title: string;
  targetOpportunityId?: string;
  targetCompany?: string;
  atsScore: number;
  lastUpdated: string;
  isBaseline: boolean;
  diffSummary?: {
    added: string[];
    modified: { original: string; tailored: string; reason: string }[];
    removed: string[];
  };
}

export interface ApplicationItem {
  id: string;
  opportunityId: string;
  company: string;
  role: string;
  stage: 'Discovered' | 'Analyzed' | 'Shortlisted' | 'Resume Ready' | 'Application Ready' | 'Approval Required' | 'Submitted' | 'Interview' | 'Rejected' | 'Offer';
  matchScore: number;
  resumeVersion: string;
  lastAction: string;
  preparedAnswers?: { question: string; answer: string }[];
  requiresApproval?: boolean;
}

export interface AgentNodeData {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  currentTask?: string;
  publicKey: string;
  delegatedScopes: string[];
  mcpServer: string;
  lastActionTime?: string;
  parentAgent?: string;
}

export interface DelegationRecord {
  id: string;
  planId: string;
  parentAgent: string;
  childAgent: string;
  allowedScopes: string[];
  restrictedScopes: string[];
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuditEventRecord {
  id: string;
  timestamp: string;
  agentName: string;
  parentAgent: string;
  toolName: string;
  mcpServer: string;
  arguments: Record<string, any>;
  decision: PolicyDecision;
  reason?: string;
  delegationId: string;
  planId: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  agent: string;
  attemptedAction: string;
  delegatedScope: string[];
  decision: PolicyDecision;
  reason: string;
  planId: string;
  delegationId: string;
}

export interface AgentActivityEvent {
  id: string;
  timestamp: string;
  agentName: string;
  action: string;
  details: string;
  status: 'info' | 'success' | 'warning' | 'error';
}
