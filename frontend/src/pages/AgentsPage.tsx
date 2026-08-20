import React from 'react';
import { mockAgents } from '../services/mockData';
import { Bot, Key, Shield, Wrench, CheckCircle2, AlertTriangle, PlayCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const AgentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
          Agent Topology & Public Key Registry
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1">
          Isolated sub-agents with independent cryptographic keypairs and delegated tool authorities.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAgents.map((agent) => (
          <div key={agent.id} className="glass-panel p-5 rounded-2xl border border-border-subtle space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-sans">{agent.name}</h3>
                  <span className="text-[11px] text-gray-400 font-mono">{agent.role}</span>
                </div>
              </div>

              <Badge variant={agent.status === 'BLOCKED' ? 'block' : agent.status === 'RUNNING' ? 'running' : 'allow'}>
                {agent.status}
              </Badge>
            </div>

            {/* Current Task */}
            <div className="p-3 rounded-xl bg-surface-hover/80 border border-border-subtle text-xs font-mono">
              <span className="text-[10px] text-gray-500 uppercase block mb-0.5">Current Task</span>
              <span className="text-indigo-300 font-semibold">{agent.currentTask}</span>
            </div>

            {/* Cryptographic Keypair */}
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>Key: <strong className="text-purple-300">{agent.publicKey}</strong></span>
            </div>

            {/* Scopes */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase font-semibold block">Delegated Scopes</span>
              <div className="flex flex-wrap gap-1">
                {agent.delegatedScopes.map((scope, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                    {scope}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
