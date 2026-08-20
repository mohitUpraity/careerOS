import React, { useState } from 'react';
import { Briefcase, Search, Filter, ArrowRight, Zap, CheckCircle2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export const OpportunitiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Job' | 'Internship' | 'Hackathon'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => apiService.getOpportunities(),
  });

  const handleLiveScrape = async () => {
    setIsScraping(true);
    try {
      await apiService.scrapeOpportunities("AI Engineer", "all");
      await queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    } catch (e) {
      console.error(e);
    } finally {
      setIsScraping(false);
    }
  };

  const filteredOpps = opportunities.filter((opp) => {
    const matchesTab = activeTab === 'All' || opp.type.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opp.requirements || opp.skills || []).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
            Live Opportunity Catalog
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Real-time web listings scraped via Firecrawl API across Unstop, LinkedIn, and Indeed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLiveScrape}
            disabled={isScraping}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-glow transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
            {isScraping ? 'Scraping Live Web...' : 'Scrape Live Jobs via Firecrawl'}
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border-subtle text-xs font-mono">
          {(['All', 'Job', 'Internship', 'Hackathon'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'All' ? 'All Roles' : `${tab}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by skill, role, or company (e.g. RAG, NVIDIA)..."
            className="w-full bg-surface-hover/80 text-xs text-white pl-9 pr-4 py-2.5 rounded-lg border border-border-subtle focus:outline-none focus:border-indigo-500/60 font-sans"
          />
        </div>

        <div className="text-xs font-mono text-gray-400">
          Showing <span className="text-white font-bold">{filteredOpps.length}</span> opportunities
        </div>
      </div>

      {/* Opportunity Cards List */}
      <div className="space-y-4">
        {filteredOpps.map((opp) => (
          <div
            key={opp.id}
            onClick={() => navigate(`/opportunities/${opp.id}`)}
            className="glass-panel p-5 rounded-2xl border border-border-subtle hover:border-indigo-500/40 transition-all cursor-pointer group hover:shadow-card"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                    {opp.type}
                  </span>
                  {opp.isRemote && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      REMOTE
                    </span>
                  )}
                  <span className="text-xs font-mono text-gray-400">{opp.deadline}</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors font-sans">
                  {opp.title}
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  {opp.company} • {opp.location} • {opp.salaryRange}
                </p>
              </div>

              {/* Match Score Matrix */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-emerald-400">{opp.matchScore}%</div>
                  <span className="text-[10px] text-gray-400 font-mono">Fit Score</span>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold font-mono text-white">{opp.atsScore}/100</div>
                  <span className="text-[10px] text-gray-400 font-mono">ATS Compatibility</span>
                </div>

                <button className="p-2.5 rounded-xl bg-surface group-hover:bg-indigo-600 text-gray-400 group-hover:text-white transition-all border border-border-subtle">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Skill Badges */}
            <div className="mt-4 pt-3 border-t border-border-subtle flex flex-wrap items-center gap-1.5">
              {opp.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-surface-hover text-gray-300 text-[11px] font-mono border border-border-subtle"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
