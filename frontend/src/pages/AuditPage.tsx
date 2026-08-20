import React from 'react';
import { useSecurityStore } from '../store/useSecurityStore';
import { History, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const AuditPage: React.FC = () => {
  const { auditEvents } = useSecurityStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
          Immutable Audit Trail
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1">
          Complete visual ledger of agent tool calls, parent delegations, and ArmorIQ decisions.
        </p>
      </div>

      {/* Timeline Events */}
      <div className="space-y-4 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-border-subtle">
        {auditEvents.map((evt) => (
          <div key={evt.id} className="relative pl-14 group">
            {/* Timeline Marker Icon */}
            <div
              className={`absolute left-3.5 top-3.5 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-canvas ${
                evt.decision === 'BLOCK'
                  ? 'border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  : 'border-emerald-500 text-emerald-400'
              }`}
            >
              {evt.decision === 'BLOCK' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`glass-panel p-5 rounded-2xl border space-y-3 transition-all ${
                evt.decision === 'BLOCK'
                  ? 'border-red-500/40 bg-red-500/5'
                  : 'border-border-subtle hover:border-indigo-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border-subtle pb-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-white">{evt.agentName}</span>
                  <span className="text-gray-500">invoked</span>
                  <span className="text-indigo-400 font-bold">{evt.mcpServer}.{evt.toolName}()</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-gray-400">{evt.timestamp}</span>
                  <Badge variant={evt.decision === 'BLOCK' ? 'block' : 'allow'}>
                    {evt.decision}
                  </Badge>
                </div>
              </div>

              {/* Arguments JSON view */}
              <div className="p-3 rounded-xl bg-canvas/80 border border-border-subtle font-mono text-xs space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">Tool Parameters</span>
                <pre className="text-gray-300 text-[11px] overflow-x-auto">
                  {JSON.stringify(evt.arguments, null, 2)}
                </pre>
              </div>

              {evt.reason && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-sans text-red-300">
                  ⚠️ <strong>Reason:</strong> {evt.reason}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-1">
                <span>Delegation Token: <strong className="text-purple-300">{evt.delegationId}</strong></span>
                <span>Plan ID: <strong className="text-white">{evt.planId}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
