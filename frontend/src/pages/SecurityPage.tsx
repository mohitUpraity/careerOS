import React from 'react';
import { MetricCard } from '../components/ui/MetricCard';
import { ShieldCheck, ShieldAlert, Lock, Key, AlertTriangle } from 'lucide-react';
import { mockSecurityViolation } from '../services/mockData';
import { useSecurityStore } from '../store/useSecurityStore';

export const SecurityPage: React.FC = () => {
  const { openViolationModal } = useSecurityStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
          ArmorIQ Security & Governance Center
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1">
          Cryptographic delegation scopes, keypair verification, and zero-trust tool authorization.
        </p>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Actions Scanned" value="1,429" icon={ShieldCheck} variant="brand" />
        <MetricCard title="Authorized Execution" value="1,428" icon={ShieldCheck} variant="success" />
        <MetricCard title="Blocked Scope Violations" value="1" icon={ShieldAlert} variant="danger" onClick={() => openViolationModal()} />
        <MetricCard title="Active Keypairs" value="7" icon={Key} />
      </div>

      {/* Active Violation Incident Alert */}
      <div className="glass-panel-danger p-6 rounded-2xl border border-red-500/40 space-y-4 shadow-glow-danger">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/40 text-red-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">Active Security Violation Event</h3>
              <span className="text-xs text-red-300 font-mono">Timestamp: {mockSecurityViolation.timestamp}</span>
            </div>
          </div>

          <button
            onClick={() => openViolationModal()}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold shadow-glow-danger transition-all"
          >
            INSPECT VIOLATION
          </button>
        </div>

        <div className="p-4 rounded-xl bg-canvas/80 border border-red-500/30 text-xs font-mono space-y-2">
          <div>Agent: <strong className="text-white">{mockSecurityViolation.agent}</strong></div>
          <div>Attempted Action: <strong className="text-red-400">{mockSecurityViolation.attemptedAction}</strong></div>
          <div>Reason: <span className="text-amber-300">{mockSecurityViolation.reason}</span></div>
        </div>
      </div>
    </div>
  );
};
