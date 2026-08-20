import React, { useState } from 'react';
import { Play, CheckCircle2, ShieldAlert, ArrowRight, RotateCcw, UserCheck, Bot, Sparkles } from 'lucide-react';
import { useSecurityStore } from '../store/useSecurityStore';
import { motion, AnimatePresence } from 'framer-motion';

export const DemoPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { openViolationModal } = useSecurityStore();

  const steps = [
    { title: '1. User Intent Submitted', desc: '"Find and prepare applications for the best AI/ML internships in Bangalore or Remote."', agent: 'User', status: 'done' },
    { title: '2. Commander Plan Generation', desc: 'Commander creates plan PLAN-8F91 & delegates scoped authority tokens to sub-agents.', agent: 'Career Commander', status: 'done' },
    { title: '3. Opportunity Discovery', desc: 'Discovery Agent executes search_jobs() → Found NVIDIA AI/ML Research Intern (94% Match).', agent: 'Discovery Agent', status: 'done' },
    { title: '4. ATS Compatibility Analysis', desc: 'ATS Agent evaluates baseline resume → Keyword Coverage 92%, Overall ATS Score 91/100.', agent: 'ATS Agent', status: 'done' },
    { title: '5. Truthful Resume Tailoring', desc: 'Resume Agent generates Mohit_NVIDIA_AI_Intern_v3.pdf from verified profile evidence.', agent: 'Resume Agent', status: 'done' },
    { title: '6. Application Form Preparation', desc: 'Application Agent populates answers and prepares form fields.', agent: 'Application Agent', status: 'done' },
    { title: '7. Unauthorized Submission Attempt', desc: 'Application Agent requests submit_application()', agent: 'Application Agent', status: 'blocked' },
    { title: '8. ArmorIQ Scope Interception', desc: 'ArmorIQ Policy verifies submit_application ∉ ["prepare_application"] → ACTION BLOCKED!', agent: 'ArmorIQ Policy', status: 'blocked' },
  ];

  const handleStartDemo = () => {
    setIsRunning(true);
    setCurrentStep(0);
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          setIsRunning(false);
          openViolationModal();
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-surface via-surface to-indigo-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 mb-2 inline-block">
            COMPETITION GOLDEN PATH DEMO
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
            ArmorIQ Security Violation Interactive Demo
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Simulates real-time multi-agent execution leading to scope violation interception & human override.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartDemo}
            disabled={isRunning}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-glow flex items-center gap-2 transition-all"
          >
            {isRunning ? (
              <span className="flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Executing Agent Loop...
              </span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Interactive Demo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Demo Step Timeline */}
      <div className="space-y-3">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: idx <= currentStep ? 1 : 0.4, x: 0 }}
            className={`glass-panel p-4 rounded-xl border transition-all ${
              idx === currentStep
                ? 'border-indigo-500/60 bg-indigo-500/10 shadow-glow'
                : idx < currentStep
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-border-subtle opacity-50'
            } ${step.status === 'blocked' && idx <= currentStep ? 'border-red-500/60 bg-red-500/10 shadow-glow-danger' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                  step.status === 'blocked' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  #{idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-sans">{step.title}</h4>
                  <p className="text-xs text-gray-400 font-mono">{step.desc}</p>
                </div>
              </div>

              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                {step.agent}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
