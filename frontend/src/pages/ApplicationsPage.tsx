import React from 'react';
import { mockApplications } from '../services/mockData';
import { Kanban, CheckCircle2, ShieldAlert, ArrowRight, Clock } from 'lucide-react';
import { useSecurityStore } from '../store/useSecurityStore';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export const ApplicationsPage: React.FC = () => {
  const { openViolationModal } = useSecurityStore();

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiService.getApplications(),
  });

  const apps = applications.length > 0 ? applications : mockApplications;

  const stages = [
    'Discovered',
    'Analyzed',
    'Shortlisted',
    'Resume Ready',
    'Approval Required',
    'Submitted',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
          Application Pipeline & Governance Board
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1">
          Automated application preparation governed by human-in-the-loop authorization.
        </p>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const appsInStage = apps.filter((a) => a.stage === stage);

          return (
            <div key={stage} className="glass-panel p-4 rounded-2xl border border-border-subtle space-y-3 min-w-[200px]">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <span className="text-xs font-mono font-bold text-gray-300">{stage}</span>
                <span className="text-xs font-mono bg-surface-hover px-2 py-0.5 rounded text-gray-400">
                  {appsInStage.length}
                </span>
              </div>

              <div className="space-y-3">
                {appsInStage.map((app) => (
                  <div
                    key={app.id}
                    className={`p-4 rounded-xl glass-panel border space-y-2 transition-all ${
                      app.requiresApproval
                        ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse-border'
                        : 'border-border-subtle hover:border-indigo-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">{app.company}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{app.matchScore}%</span>
                    </div>

                    <h4 className="text-xs font-bold text-white font-sans">{app.role}</h4>
                    <p className="text-[11px] text-gray-400 font-mono line-clamp-2">{app.lastAction}</p>

                    {app.requiresApproval && (
                      <button
                        onClick={() => openViolationModal()}
                        className="w-full mt-2 py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-[11px] font-bold flex items-center justify-center gap-1 shadow-glow-danger transition-all"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>REVIEW APPROVAL</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
