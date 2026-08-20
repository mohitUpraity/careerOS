import React from 'react';
import { mockDelegations } from '../services/mockData';
import { GitBranch, Shield, Key, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export const DelegationsPage: React.FC = () => {
  const { data: delegations = [] } = useQuery({
    queryKey: ['delegations'],
    queryFn: () => apiService.getDelegations(),
  });

  const list = delegations.length > 0 ? delegations : mockDelegations;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
          Agent Delegation Registry (ArmorIQ)
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1">
          Cryptographically signed delegation tokens granted by parent agents to specialized sub-agents.
        </p>
      </div>

      {/* Delegations List */}
      <div className="space-y-4">
        {list.map((del) => (
          <div key={del.id} className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
              <div className="flex items-center gap-3">
                <GitBranch className="w-5 h-5 text-indigo-400" />
                <span className="font-mono text-xs font-bold text-white">
                  {del.parentAgent} → <span className="text-indigo-400">{del.childAgent}</span>
                </span>
              </div>
              <span className="text-[11px] font-mono text-gray-400">PLAN ID: <strong className="text-white">{del.planId}</strong></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* Allowed Scopes */}
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/30 space-y-1.5">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Allowed Tool Scopes</span>
                <div className="flex flex-wrap gap-1">
                  {del.allowedScopes.map((scope, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      ✓ {scope}
                    </span>
                  ))}
                </div>
              </div>

              {/* Restricted Scopes */}
              <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/30 space-y-1.5">
                <span className="text-[10px] text-red-400 font-bold uppercase block">Restricted / Blocked Scopes</span>
                <div className="flex flex-wrap gap-1">
                  {del.restrictedScopes.map((scope, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/30 font-bold">
                      ❌ {scope}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-2">
              <span>Token: <strong className="text-purple-300">{del.token}</strong></span>
              <span>Expires: {del.expiresAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
