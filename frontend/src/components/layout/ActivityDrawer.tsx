import React from 'react';
import { useAgentStore } from '../../store/useAgentStore';
import { Activity, X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityDrawer: React.FC<ActivityDrawerProps> = ({ isOpen, onClose }) => {
  const { activities } = useAgentStore();

  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <aside className="w-80 glass-panel border-l border-border-subtle h-screen fixed right-0 top-0 z-40 flex flex-col justify-between shadow-2xl">
      {/* Drawer Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border-subtle bg-canvas-subtle/80">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Live Agent Stream
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Activity Event Stream */}
      <div className="p-3 overflow-y-auto flex-1 space-y-2.5">
        <AnimatePresence initial={false}>
          {activities.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-lg bg-surface/80 border border-border-subtle hover:border-indigo-500/30 transition-all text-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-[10px] text-gray-400 font-semibold">{item.timestamp}</span>
                <span className="font-mono text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  {item.agentName}
                </span>
              </div>

              <div className="flex items-start gap-2">
                {getStatusIcon(item.status)}
                <div>
                  <div className="font-medium text-gray-200 text-xs">{item.action}</div>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed font-sans">{item.details}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border-subtle bg-canvas-subtle/80 text-[10px] font-mono text-gray-500 text-center">
        SSE STREAM ACTIVE — ARMORIQ ENFORCED
      </div>
    </aside>
  );
};
