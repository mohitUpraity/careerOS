import React from 'react';
import { MetricCard } from '../components/ui/MetricCard';
import { AgentFlowGraph } from '../components/agents/AgentFlowGraph';
import { Briefcase, Zap, Star, CheckCircle2, ShieldAlert, Play, ArrowRight } from 'lucide-react';
import { mockOpportunities } from '../services/mockData';
import { useNavigate } from 'react-router-dom';
import { useSecurityStore } from '../store/useSecurityStore';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { openViolationModal } = useSecurityStore();

  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => apiService.getOpportunities(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiService.getApplications(),
  });

  const { data: securityEvents = [] } = useQuery({
    queryKey: ['securityEvents'],
    queryFn: () => apiService.getSecurityEvents(),
  });

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-surface via-surface to-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Good evening, Mohit 👋
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Your career operations are running autonomously under ArmorIQ governance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/demo')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow flex items-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Security Demo</span>
          </button>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Opportunities Found"
          value={opportunities.length > 0 ? opportunities.length.toString() : "127"}
          subtitle="Across 4 portals"
          icon={Briefcase}
          trend="+3 today"
          onClick={() => navigate('/opportunities')}
        />
        <MetricCard
          title="Strong Matches"
          value={opportunities.length > 0 ? opportunities.filter(o => o.matchScore >= 85).length.toString() : "43"}
          subtitle="Score > 85%"
          icon={Zap}
          variant="brand"
          onClick={() => navigate('/matches')}
        />
        <MetricCard
          title="High Confidence"
          value={opportunities.length > 0 ? opportunities.filter(o => o.eligibilityScore === 100).length.toString() : "12"}
          subtitle="Verified evidence"
          icon={Star}
          variant="success"
          onClick={() => navigate('/opportunities')}
        />
        <MetricCard
          title="Applications Ready"
          value={applications.length > 0 ? applications.filter(a => a.stage === 'Application Ready').length.toString() : "5"}
          subtitle="Fields prepared"
          icon={CheckCircle2}
          onClick={() => navigate('/applications')}
        />
        <MetricCard
          title="Blocked Action"
          value={securityEvents.length > 0 ? securityEvents.length.toString() : "1"}
          subtitle="Scope violation alert"
          icon={ShieldAlert}
          variant="danger"
          onClick={() => openViolationModal()}
        />
      </div>

      {/* Multi-Agent Network Visualizer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-gray-300">
            Autonomous Agent Orchestration Graph
          </h2>
          <button
            onClick={() => navigate('/agents')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1"
          >
            <span>View Full Topology</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <AgentFlowGraph />
      </div>

      {/* Recommended Opportunities Row */}
      <div className="space-y-3">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-gray-300">
          Top AI Opportunity Fits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(opportunities.length > 0 ? opportunities : mockOpportunities).slice(0, 2).map((opp) => (
            <div
              key={opp.id}
              onClick={() => navigate(`/opportunities/${opp.id}`)}
              className="glass-panel p-5 rounded-xl border border-border-subtle hover:border-indigo-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {opp.type}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5 group-hover:text-indigo-400 transition-colors">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">{opp.company} • {opp.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-emerald-400">{opp.matchScore}%</div>
                  <span className="text-[10px] text-gray-400 font-mono">Match Score</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-border-subtle text-xs font-mono">
                <span className="text-gray-400">ATS Score: <strong className="text-white">{opp.atsScore}/100</strong></span>
                <span className="text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Intelligence Report <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
