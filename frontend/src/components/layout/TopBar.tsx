import React, { useState } from 'react';
import { Search, ShieldCheck, Activity, Play, Command, Bell } from 'lucide-react';
import { useSecurityStore } from '../../store/useSecurityStore';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onToggleDrawer: () => void;
  isDrawerOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleDrawer, isDrawerOpen }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { openViolationModal } = useSecurityStore();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/opportunities?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="h-16 px-6 glass-panel border-b border-border-subtle flex items-center justify-between sticky top-0 z-20">
      {/* Search / Command Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask CareerOS anything... (e.g. Find remote AI internships, Re-rank by salary)"
            className="w-full bg-surface-hover/80 text-xs text-white pl-10 pr-20 py-2.5 rounded-lg border border-border-subtle focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all font-sans placeholder:text-gray-500"
          />
          <div className="absolute right-3 flex items-center gap-1 text-[10px] font-mono text-gray-400 bg-surface px-1.5 py-0.5 rounded border border-border-subtle">
            <Command className="w-3 h-3" /> K
          </div>
        </div>
      </form>

      {/* Action Controls & ArmorIQ Status */}
      <div className="flex items-center gap-3">
        {/* ArmorIQ Security Shield Badge */}
        <button
          onClick={() => openViolationModal()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium hover:bg-emerald-500/20 transition-all"
          title="ArmorIQ Security Policy Active"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ARMORIQ ENFORCED</span>
        </button>

        {/* Security Violation Trigger Button */}
        <button
          onClick={() => navigate('/demo')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium hover:bg-indigo-600/30 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Security Demo</span>
        </button>

        {/* Toggle Activity Drawer */}
        <button
          onClick={onToggleDrawer}
          className={`p-2 rounded-lg text-xs border transition-all ${
            isDrawerOpen
              ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400'
              : 'bg-surface border-border-subtle text-gray-400 hover:text-white hover:bg-surface-hover'
          }`}
          title="Toggle Streaming Agent Activity Feed"
        >
          <Activity className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
