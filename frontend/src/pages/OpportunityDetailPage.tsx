import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockOpportunities } from '../services/mockData';
import { ArrowLeft, CheckCircle2, AlertCircle, XCircle, FileText, Send, Sparkles, ShieldAlert } from 'lucide-react';
import { useSecurityStore } from '../store/useSecurityStore';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openViolationModal } = useSecurityStore();

  const opportunity = mockOpportunities.find((o) => o.id === id) || mockOpportunities[0];

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <button
        onClick={() => navigate('/opportunities')}
        className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Opportunities</span>
      </button>

      {/* Intelligence Report Header */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-surface via-surface to-indigo-950/20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
              {opportunity.type}
            </span>
            <span className="text-xs font-mono text-emerald-400">{opportunity.deadline}</span>
          </div>

          <h1 className="text-2xl font-bold text-white font-sans">{opportunity.title}</h1>
          <p className="text-xs text-gray-400 font-mono mt-1">
            {opportunity.company} • {opportunity.location} • {opportunity.salaryRange}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/resume`)}
            className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-gray-200 border border-border-subtle text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Tailor Resume</span>
          </button>

          <button
            onClick={() => openViolationModal()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow flex items-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Prepare Application</span>
          </button>
        </div>
      </div>

      {/* Candidate Fit Radial & Metric Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Score Card */}
        <div className="glass-panel p-6 rounded-2xl border border-border-subtle flex flex-col items-center justify-center text-center">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-2">
            Overall Candidate Fit Score
          </span>
          <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 flex items-center justify-center bg-emerald-500/5 my-2 shadow-glow-success">
            <span className="text-4xl font-bold font-mono text-emerald-400">{opportunity.matchScore}%</span>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-2">
            High Confidence Match grounded in verified candidate profile evidence.
          </p>
        </div>

        {/* Fit Score Factors */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-border-subtle space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-gray-300">
            Fit Breakdown Matrix
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Skills Match', score: opportunity.skillScore, color: 'bg-emerald-400' },
              { label: 'ATS Compatibility Score', score: opportunity.atsScore, color: 'bg-indigo-400' },
              { label: 'Eligibility Check', score: opportunity.eligibilityScore, color: 'bg-blue-400' },
              { label: 'Domain & Experience Alignment', score: 88, color: 'bg-purple-400' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300">{item.label}</span>
                  <span className="text-white font-bold">{item.score}%</span>
                </div>
                <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Overlap Analysis */}
      <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-gray-300">
          Verified Skill Overlap Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Matched */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>MATCHED SKILLS ({opportunity.skills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {opportunity.skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-xs font-mono border border-emerald-500/30">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Partial */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>PARTIAL / RELATED</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {opportunity.partialSkills?.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-xs font-mono border border-amber-500/30">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Missing */}
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400">
              <XCircle className="w-4 h-4" />
              <span>MISSING (NOT IN PROFILE)</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {opportunity.missingSkills?.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-red-500/10 text-red-300 text-xs font-mono border border-red-500/30">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
