import React, { useState } from 'react';
import { mockOpportunities } from '../services/mockData';
import { Sliders, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export const MatchesPage: React.FC = () => {
  const [remotePriority, setRemotePriority] = useState(50);
  const [salaryPriority, setSalaryPriority] = useState(30);

  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => apiService.getOpportunities(),
  });

  const opps = opportunities.length > 0 ? opportunities : mockOpportunities;

  // Compute re-weighted scores dynamically
  const reRankedOpps = [...opps]
    .map((opp) => {
      let scoreBonus = 0;
      if (opp.isRemote) scoreBonus += (remotePriority / 100) * 8;
      const computedScore = Math.min(100, Math.round(opp.matchScore + scoreBonus));
      return { ...opp, computedScore };
    })
    .sort((a, b) => b.computedScore - a.computedScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
          Dynamic Re-Ranking Lab
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1">
          Adjust candidate preference weights to re-calculate opportunity ranks in real-time.
        </p>
      </div>

      {/* Preference Controls Sliders */}
      <div className="glass-panel p-6 rounded-2xl border border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Remote Weight */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-gray-300 font-bold">Remote Work Priority</span>
            <span className="text-indigo-400 font-bold">+{remotePriority}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={remotePriority}
            onChange={(e) => setRemotePriority(Number(e.target.value))}
            className="w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Salary Weight */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-gray-300 font-bold">Salary Urgency Weight</span>
            <span className="text-emerald-400 font-bold">+{salaryPriority}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={salaryPriority}
            onChange={(e) => setSalaryPriority(Number(e.target.value))}
            className="w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* Re-Ranked Opportunity Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-gray-300">
          Re-Weighted Opportunity Rankings
        </h3>

        <div className="space-y-3">
          <AnimatePresence>
            {reRankedOpps.map((opp, index) => (
              <motion.div
                key={opp.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="glass-panel p-5 rounded-2xl border border-border-subtle flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-hover border border-border-subtle flex items-center justify-center font-mono font-bold text-lg text-indigo-400">
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-sans">{opp.title}</span>
                      <span className="text-xs text-gray-400 font-mono">({opp.company})</span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono">{opp.location} • {opp.salaryRange}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-emerald-400">{opp.computedScore}%</div>
                  <span className="text-[10px] text-gray-400 font-mono">Re-Weighted Fit</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
