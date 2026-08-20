import React, { useState } from 'react';
import { mockResumes } from '../services/mockData';
import { FileText, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Layers, Eye } from 'lucide-react';

export const ResumePage: React.FC = () => {
  const [selectedVersion, setSelectedVersion] = useState(mockResumes[1]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
          Resume Lab & Truthful Tailoring Engine
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1">
          Zero-hallucination resume versions grounded strictly in verified profile evidence.
        </p>
      </div>

      {/* Baseline vs Tailored Version Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockResumes.map((res) => (
          <div
            key={res.id}
            onClick={() => setSelectedVersion(res)}
            className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedVersion.id === res.id
                ? 'border-indigo-500/60 bg-indigo-500/10 shadow-glow'
                : 'border-border-subtle hover:border-indigo-500/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {res.isBaseline ? (
                    <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                      BASELINE RESUME
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      TAILORED — {res.targetCompany}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white font-sans">{res.title}</h3>
                <span className="text-xs text-gray-400 font-mono">Updated: {res.lastUpdated}</span>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold font-mono text-emerald-400">{res.atsScore}/100</div>
                <span className="text-[10px] text-gray-400 font-mono">ATS Score</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Side-by-Side Diff View */}
      {selectedVersion.diffSummary && (
        <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Side-by-Side Resume Diff ({selectedVersion.targetCompany})
            </h3>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              VERIFIED PROFILE EVIDENCE ONLY
            </span>
          </div>

          {/* Diff Content Comparison */}
          <div className="space-y-4 font-mono text-xs">
            {/* Added Highlights */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">Added Evidence Highlights</span>
              {selectedVersion.diffSummary.added.map((item, idx) => (
                <div key={idx} className="text-emerald-300 text-xs">
                  + {item}
                </div>
              ))}
            </div>

            {/* Modified Items with Explanation */}
            <div className="space-y-3">
              <span className="text-[10px] text-amber-400 font-bold uppercase block">Modified & Rephrased Bullets</span>
              {selectedVersion.diffSummary.modified.map((mod, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-surface/80 border border-border-subtle space-y-2">
                  <div className="text-red-400/80 line-through">
                    - {mod.original}
                  </div>
                  <div className="text-emerald-400 font-bold">
                    + {mod.tailored}
                  </div>
                  <div className="text-[11px] text-indigo-300 bg-indigo-500/10 p-2 rounded border border-indigo-500/20 font-sans">
                    💡 <strong>Explanation:</strong> {mod.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
