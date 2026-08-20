import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Trophy,
  Sliders,
  FileText,
  Kanban,
  Bot,
  GitBranch,
  ShieldCheck,
  History,
  ShieldAlert,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Zap,
} from 'lucide-react';
import { mockUser } from '../../services/mockData';
import { clsx } from 'clsx';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navGroups = [
    {
      title: 'COMMAND CENTER',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Opportunities', path: '/opportunities', icon: Briefcase },
        { label: 'Competitions', path: '/competitions', icon: Trophy },
        { label: 'Re-Ranking Lab', path: '/matches', icon: Sliders },
        { label: 'Resume Lab', path: '/resume', icon: FileText },
        { label: 'Applications', path: '/applications', icon: Kanban },
      ],
    },
    {
      title: 'AI OPERATIONS',
      items: [
        { label: 'Agent Network', path: '/agents', icon: Bot },
        { label: 'Delegations', path: '/delegations', icon: GitBranch },
        { label: 'Audit Trail', path: '/audit', icon: History },
      ],
    },
    {
      title: 'SECURITY (ARMORIQ)',
      items: [
        { label: 'Security Dashboard', path: '/security', icon: ShieldCheck },
        { label: 'Run Demo Mode', path: '/demo', icon: PlayCircle, badge: 'DEMO' },
      ],
    },
  ];

  return (
    <aside
      className={clsx(
        'glass-panel border-r border-border-subtle flex flex-col justify-between transition-all duration-300 relative z-30 h-screen select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top Header & Logo */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-border-subtle">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-400 p-0.5 shadow-glow">
                <div className="w-full h-full bg-canvas rounded-[10px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-white font-sans">Career<span className="text-indigo-400">OS</span></span>
                <span className="block text-[10px] font-mono text-emerald-400 font-medium">ARMORIQ SECURED</span>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5">
              <div className="w-full h-full bg-canvas rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <span className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-500">
                  {group.title}
                </span>
              )}

              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group relative',
                      isActive
                        ? 'bg-indigo-600/15 text-white border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-surface-hover'
                    )
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-indigo-400" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-border-subtle bg-canvas-subtle/50">
        <div className={clsx('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="relative">
            <img
              src={mockUser.avatarUrl}
              alt={mockUser.name}
              className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-canvas" />
          </div>

          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">{mockUser.name}</div>
              <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                {mockUser.availability} ({mockUser.completeness}%)
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
