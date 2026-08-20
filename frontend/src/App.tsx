import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';

import { DashboardPage } from './pages/DashboardPage';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { ResumePage } from './pages/ResumePage';
import { MatchesPage } from './pages/MatchesPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { AgentsPage } from './pages/AgentsPage';
import { DelegationsPage } from './pages/DelegationsPage';
import { AuditPage } from './pages/AuditPage';
import { SecurityPage } from './pages/SecurityPage';
import { DemoPage } from './pages/DemoPage';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/command" replace />} />
            <Route path="command" element={<CommandCenterPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="opportunities" element={<OpportunitiesPage />} />
            <Route path="opportunities/:id" element={<OpportunityDetailPage />} />
            <Route path="competitions" element={<OpportunitiesPage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="delegations" element={<DelegationsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="demo" element={<DemoPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
