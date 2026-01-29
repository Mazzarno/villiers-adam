'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Calendar,
  Image,
  Settings,
  History,
  FolderOpen,
  Building2,
  ClipboardList,
  MessageSquare,
  CalendarClock,
  Landmark,
  Briefcase,
  Bus,
  ChevronLeft,
  LogOut,
  Users,
  Store,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useContentCounts } from '@/hooks/use-content-counts';

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

interface SidebarContentProps extends SidebarProps {
  showCollapse?: boolean;
  onNavigate?: () => void;
}

const navigation = [
  {
    title: 'Principal',
    items: [
      { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Contenus',
    items: [
      { name: 'Actualités', href: '/content/articles', icon: Newspaper, showBadge: 'articles' },
      { name: 'Événements', href: '/content/events', icon: Calendar, showBadge: 'events' },
      { name: 'Médias', href: '/media', icon: Image },
    ],
  },
  {
    title: 'Mairie',
    items: [
      { name: 'Conseil municipal', href: '/mairie/conseil', icon: Landmark },
      { name: 'Services municipaux', href: '/mairie/services', icon: Briefcase },
      { name: 'Transports', href: '/transports', icon: Bus },
    ],
  },
  {
    title: 'Annuaire',
    items: [
      { name: 'Associations', href: '/annuaire?type=ASSOCIATION', icon: Users },
      { name: 'Entreprises', href: '/annuaire?type=ENTERPRISE', icon: Building2 },
      { name: 'Commerces', href: '/annuaire?type=COMMERCE', icon: Store },
      { name: 'Démarches', href: '/demarches', icon: ClipboardList },
    ],
  },
  {
    title: 'Administration',
    items: [
      { name: 'Utilisateurs', href: '/users', icon: UserCog },
      { name: 'Historique', href: '/audit', icon: History },
      { name: 'Paramètres', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-sidebar',
        'hidden lg:flex flex-col',
      )}
    >
      <SidebarContent collapsed={collapsed} onCollapse={onCollapse} />
    </motion.aside>
  );
}

export function SidebarMobile({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="h-full bg-sidebar">
      <SidebarContent
        collapsed={false}
        onCollapse={() => {}}
        showCollapse={false}
        onNavigate={onNavigate}
      />
    </div>
  );
}

function SidebarContent({
  collapsed,
  onCollapse,
  showCollapse = true,
  onNavigate,
}: SidebarContentProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const counts = useContentCounts();

  const userInitials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'U';
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';

  const getBadgeCount = (type: string) => {
    if (counts.isLoading) return 0;
    switch (type) {
      case 'articles':
        return counts.draftArticles + counts.scheduledArticles;
      case 'events':
        return counts.draftEvents + counts.scheduledEvents;
      default:
        return 0;
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1 }}
          className="flex items-center gap-2 overflow-hidden"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">VA</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground whitespace-nowrap">
              Villiers-Adam
            </span>
          )}
        </motion.div>
        {showCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapse(!collapsed)}
            className="h-8 w-8 shrink-0"
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                collapsed && 'rotate-180',
              )}
            />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navigation.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                  {group.title}
                </h4>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href));

                  const badgeCount = item.showBadge ? getBadgeCount(item.showBadge) : 0;
                  const showBadge = badgeCount > 0 && !collapsed;

                  const linkContent = (
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground',
                        collapsed && 'justify-center px-2',
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.name}</span>
                          {showBadge && (
                            <Badge variant="secondary" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
                              {badgeCount}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right">
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.href}>{linkContent}</div>;
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">{userName}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
            </div>
          </div>
        )}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full" onClick={() => logout()}>
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Déconnexion</TooltipContent>
          </Tooltip>
        ) : (
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => logout()}>
            <LogOut className="h-5 w-5" />
            Déconnexion
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}
