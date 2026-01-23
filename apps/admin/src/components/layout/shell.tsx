'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main
        className={cn(
          'min-h-[calc(100vh-4rem)] pt-16 transition-[margin-left] duration-200',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-64',
        )}
      >
        <div className="container py-6">{children}</div>
      </main>
    </div>
  );
}
