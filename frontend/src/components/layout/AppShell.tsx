import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ActivityDrawer } from './ActivityDrawer';
import { ArmorIQModal } from '../security/ArmorIQModal';
import { Outlet } from 'react-router-dom';

export const AppShell: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Command Bar */}
        <TopBar
          onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
          isDrawerOpen={isDrawerOpen}
        />

        {/* Dynamic Route Canvas */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Outlet />
        </main>
      </div>

      {/* Streaming Right Activity Drawer */}
      <ActivityDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Global ArmorIQ Security Violation Intercept Modal */}
      <ArmorIQModal />
    </div>
  );
};
