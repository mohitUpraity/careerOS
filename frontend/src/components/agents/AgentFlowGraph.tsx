import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, Position, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAgentStore } from '../../store/useAgentStore';
import { Bot, Shield, Wrench, User, CheckCircle2, AlertTriangle, Play, ShieldAlert } from 'lucide-react';
import { Badge } from '../ui/Badge';

const CustomAgentNode = ({ data }: { data: any }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'running';
      case 'BLOCKED':
        return 'block';
      case 'COMPLETED':
        return 'allow';
      case 'WAITING':
        return 'pending';
      default:
        return 'idle';
    }
  };

  return (
    <div
      className={`glass-panel p-4 rounded-xl w-64 border transition-all duration-300 shadow-card ${
        data.status === 'BLOCKED'
          ? 'border-red-500/80 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse-border'
          : data.status === 'RUNNING'
          ? 'border-indigo-500/60 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
          : 'border-border-subtle hover:border-indigo-500/40'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {data.isSecurity ? (
            <Shield className="w-5 h-5 text-emerald-400" />
          ) : data.isUser ? (
            <User className="w-5 h-5 text-blue-400" />
          ) : data.isMcp ? (
            <Wrench className="w-5 h-5 text-purple-400" />
          ) : (
            <Bot className="w-5 h-5 text-indigo-400" />
          )}
          <span className="font-bold text-xs text-white truncate font-sans">{data.label}</span>
        </div>
        <Badge variant={getStatusVariant(data.status)} size="sm">
          {data.status}
        </Badge>
      </div>

      <div className="space-y-1 text-[11px] font-mono text-gray-400">
        {data.role && <div className="text-gray-300 font-sans text-xs">{data.role}</div>}
        {data.currentTask && (
          <p className="text-[10px] text-indigo-300 line-clamp-2 bg-indigo-500/10 p-1.5 rounded border border-indigo-500/20">
            {data.currentTask}
          </p>
        )}
        {data.mcpServer && (
          <div className="text-[10px] text-gray-500 flex items-center justify-between">
            <span>MCP Server:</span>
            <span className="text-purple-300 font-semibold">{data.mcpServer}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  agentNode: CustomAgentNode,
};

export const AgentFlowGraph: React.FC = () => {
  const { agents } = useAgentStore();

  const nodes: Node[] = useMemo(() => {
    return [
      {
        id: 'user-node',
        type: 'agentNode',
        position: { x: 400, y: 20 },
        data: { label: 'User Intent', role: 'Mohit Upraity', status: 'COMPLETED', isUser: true },
      },
      {
        id: 'agent-commander',
        type: 'agentNode',
        position: { x: 400, y: 140 },
        data: {
          label: 'Career Commander',
          role: 'Root Orchestrator',
          status: agents.find((a) => a.id === 'agent-commander')?.status || 'RUNNING',
          currentTask: 'PLAN-8F91 Execution',
        },
      },
      {
        id: 'agent-discovery',
        type: 'agentNode',
        position: { x: 50, y: 300 },
        data: {
          label: 'Discovery Agent',
          role: 'Opportunity Scraper',
          status: agents.find((a) => a.id === 'agent-discovery')?.status || 'COMPLETED',
          mcpServer: 'opportunity-mcp',
        },
      },
      {
        id: 'agent-ats',
        type: 'agentNode',
        position: { x: 290, y: 300 },
        data: {
          label: 'ATS Agent',
          role: 'Resume Scorer',
          status: agents.find((a) => a.id === 'agent-ats')?.status || 'COMPLETED',
          mcpServer: 'resume-mcp',
        },
      },
      {
        id: 'agent-resume',
        type: 'agentNode',
        position: { x: 530, y: 300 },
        data: {
          label: 'Resume Agent',
          role: 'Truthful Tailoring',
          status: agents.find((a) => a.id === 'agent-resume')?.status || 'COMPLETED',
          mcpServer: 'resume-mcp',
        },
      },
      {
        id: 'agent-application',
        type: 'agentNode',
        position: { x: 770, y: 300 },
        data: {
          label: 'Application Agent',
          role: 'Form Prep & Submitter',
          status: agents.find((a) => a.id === 'agent-application')?.status || 'BLOCKED',
          mcpServer: 'application-mcp',
          currentTask: 'Attempted submit_application()',
        },
      },
      {
        id: 'armoriq-shield',
        type: 'agentNode',
        position: { x: 400, y: 460 },
        data: {
          label: 'ArmorIQ Policy Layer',
          role: 'Cryptographic Scope Enforcement',
          status: 'BLOCKED',
          isSecurity: true,
          currentTask: 'Intercepted unauthorized tool call',
        },
      },
    ];
  }, [agents]);

  const edges: Edge[] = useMemo(
    () => [
      { id: 'e-user-cmd', source: 'user-node', target: 'agent-commander', animated: true, style: { stroke: '#6366F1', strokeWidth: 2 } },
      { id: 'e-cmd-disc', source: 'agent-commander', target: 'agent-discovery', animated: true, style: { stroke: '#10B981' } },
      { id: 'e-cmd-ats', source: 'agent-commander', target: 'agent-ats', animated: true, style: { stroke: '#10B981' } },
      { id: 'e-cmd-res', source: 'agent-commander', target: 'agent-resume', animated: true, style: { stroke: '#10B981' } },
      { id: 'e-cmd-app', source: 'agent-commander', target: 'agent-application', animated: true, style: { stroke: '#EF4444', strokeWidth: 2 } },
      { id: 'e-disc-sec', source: 'agent-discovery', target: 'armoriq-shield', style: { stroke: '#374151' } },
      { id: 'e-ats-sec', source: 'agent-ats', target: 'armoriq-shield', style: { stroke: '#374151' } },
      { id: 'e-res-sec', source: 'agent-resume', target: 'armoriq-shield', style: { stroke: '#374151' } },
      { id: 'e-app-sec', source: 'agent-application', target: 'armoriq-shield', animated: true, style: { stroke: '#EF4444', strokeWidth: 3 } },
    ],
    []
  );

  return (
    <div className="w-full h-[520px] rounded-2xl glass-panel border border-border-subtle overflow-hidden relative">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background color="#1e2235" gap={20} size={1} />
        <Controls />
      </ReactFlow>

      {/* Floating Status Overlay Legend */}
      <div className="absolute bottom-4 right-4 glass-panel p-3 rounded-xl border border-border-subtle text-xs flex items-center gap-4 font-mono">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Running</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 animate-ping" /> Scope Blocked</span>
      </div>
    </div>
  );
};
