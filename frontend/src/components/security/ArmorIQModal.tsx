import React from 'react';
import { useSecurityStore } from '../../store/useSecurityStore';
import { ShieldAlert, AlertTriangle, ArrowRight, Lock, CheckCircle2, FileText, UserCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ArmorIQModal: React.FC = () => {
  const { isViolationModalOpen, activeViolation, closeViolationModal, approveViolation } = useSecurityStore();

  if (!isViolationModalOpen || !activeViolation) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl glass-panel-danger rounded-2xl p-6 shadow-glow-danger relative overflow-hidden border border-red-500/50"
        >
          {/* Top Banner Alert */}
          <div className="flex items-center justify-between border-b border-red-500/30 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/40 text-red-400 animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  ARMORIQ POLICY VIOLATION INTERCEPTED
                </h3>
                <p className="text-xs text-red-300 font-mono">
                  Scope Mismatch Detected — Action Blocked by ArmorIQ Policy Engine
                </p>
              </div>
            </div>
            <button
              onClick={closeViolationModal}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action & Scope Details */}
          <div className="space-y-4 text-xs font-mono">
            {/* Attempted Action Box */}
            <div className="p-3.5 rounded-xl bg-canvas/80 border border-red-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-0.5">Attempted Tool Invocation</span>
                <span className="text-sm font-bold text-red-400">{activeViolation.agent}.{activeViolation.attemptedAction}</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/40 text-xs">
                BLOCKED
              </span>
            </div>

            {/* Scope Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-surface/80 border border-border-subtle">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Delegated Authority Scope</span>
                <div className="flex flex-wrap gap-1">
                  {activeViolation.delegatedScope.map((scope, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px]">
                      ✓ {scope}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface/80 border border-red-500/30">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Unauthorized Target Action</span>
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-bold">
                  ❌ {activeViolation.attemptedAction}
                </span>
              </div>
            </div>

            {/* Delegation Lineage Chain */}
            <div className="p-3.5 rounded-xl bg-canvas-subtle/80 border border-border-subtle">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-2">Delegation Lineage Chain</span>
              <div className="flex items-center gap-2 text-xs font-sans">
                <span className="px-2 py-1 bg-surface rounded border border-border-subtle text-gray-300 font-mono">User</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                <span className="px-2 py-1 bg-surface rounded border border-border-subtle text-indigo-300 font-mono">Commander</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                <span className="px-2 py-1 bg-surface rounded border border-border-subtle text-indigo-300 font-mono">{activeViolation.agent}</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-500" />
                <span className="px-2 py-1 bg-red-500/20 rounded border border-red-500/50 text-red-300 font-bold font-mono">ArmorIQ Intercept (BLOCKED)</span>
              </div>
            </div>

            {/* Reason Explanation */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-sans flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-semibold text-xs block mb-0.5">Governance Policy Mandate:</span>
                <p className="text-xs text-amber-200/90 leading-relaxed">{activeViolation.reason}</p>
              </div>
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-red-500/30">
            <div className="text-[10px] font-mono text-gray-400">
              PLAN ID: <span className="text-white font-bold">{activeViolation.planId}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={closeViolationModal}
                className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover text-gray-300 text-xs font-medium border border-border-subtle transition-all"
              >
                Keep Blocked
              </button>

              <button
                onClick={() => approveViolation(activeViolation.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glow-success flex items-center gap-1.5 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Approve Human Override</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
