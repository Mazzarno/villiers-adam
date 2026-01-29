'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Sidebar, SidebarMobile } from './sidebar';
import { Header } from './header';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <div className="min-h-[100dvh] bg-background">
      <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      <Header
        sidebarCollapsed={sidebarCollapsed}
        onOpenMobileNav={() => setMobileNavOpen(true)}
      />
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarMobile onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>
      <main
        className={cn(
          'min-h-[calc(100dvh-4rem)] pt-16 transition-[margin-left] duration-200 ml-0',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64',
        )}
      >
        <div className="container px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
