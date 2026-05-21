'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Image as ImageIcon,
  Mail,
  Zap,
  Clock,
  Landmark,
  Briefcase,
  Info,
  GraduationCap,
  UtensilsCrossed,
  Bus,
  Store,
  Home,
  Users,
  Dumbbell,
  BookOpen,
  History,
  Download,
  Settings,
  ChevronLeft,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

interface SidebarContentProps extends SidebarProps {
  showCollapse?: boolean;
  onNavigate?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const resolveAvatarUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_URL}${url}`;
};

const navigation: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Contenus',
    items: [
      { name: 'Actualités', href: '/content/articles', icon: Newspaper },
      { name: 'Événements', href: '/content/events', icon: Calendar },
      { name: 'Médias', href: '/media', icon: ImageIcon },
      { name: 'Newsletters', href: '/newsletters', icon: Mail },
      { name: 'Flash infos', href: '/flash-infos', icon: Zap },
    ],
  },
  {
    title: 'Mairie',
    items: [
      { name: 'Horaires d\'ouverture', href: '/mairie/horaires', icon: Clock },
      { name: 'Conseil municipal', href: '/mairie/conseil', icon: Landmark },
      { name: 'Services municipaux', href: '/mairie/services', icon: Briefcase },
    ],
  },
  {
    title: 'Vie quotidienne',
    items: [
      { name: 'Infos pratiques', href: '/vie-quotidienne/infos-pratiques', icon: Info },
      { name: 'École et enfance', href: '/vie-quotidienne/ecole-enfance', icon: GraduationCap },
      { name: 'Restauration scolaire', href: '/vie-quotidienne/restauration', icon: UtensilsCrossed },
      { name: 'Transports et transport scolaire', href: '/transports', icon: Bus },
      { name: 'Commerces et entreprises', href: '/annuaire?type=ECONOMY', icon: Store },
    ],
  },
  {
    title: 'Culture & Loisirs',
    items: [
      { name: 'Centre de loisirs', href: '/culture-loisirs/centre-loisirs', icon: Home },
      { name: 'Associations', href: '/culture-loisirs/associations', icon: Users },
      { name: 'Sports', href: '/culture-loisirs/sports', icon: Dumbbell },
      { name: 'Bibliothèque', href: '/culture-loisirs/bibliotheque', icon: BookOpen },
    ],
  },
  {
    title: 'Administration',
    items: [
      { name: 'Historique', href: '/audit', icon: History },
      { name: 'Export / Import', href: '/administration/export-import', icon: Download },
      { name: 'Paramètres', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
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
  const [openGroups, setOpenGroups] = React.useState<string[]>(['Principal', 'Contenus']);

  const userInitials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'U';
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title)
        ? prev.filter((g) => g !== title)
        : [...prev, title]
    );
  };

  const isItemActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/') || pathname.startsWith(href + '?');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col min-h-0">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <motion.div
            initial={false}
            animate={{ opacity: collapsed ? 0 : 1 }}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-villiers-blue to-villiers-gold p-1">
              <Image src="/images/blason.svg" alt="Blason" width={28} height={28} />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-sidebar-foreground whitespace-nowrap">
                  Villiers-Adam
                </span>
                <span className="text-xs text-sidebar-foreground/60">
                  Administration
                </span>
              </div>
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
        <ScrollArea className="flex-1 min-h-0 px-3 py-4" type="always">
          <nav className="space-y-4">
            {navigation.map((group) => (
              <div key={group.title}>
                {collapsed ? (
                  // Mode collapsed: afficher juste les icônes
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = isItemActive(item.href);
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              onClick={onNavigate}
                              className={cn(
                                'flex items-center justify-center rounded-lg p-2 transition-colors',
                                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                isActive
                                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                  : 'text-sidebar-foreground',
                              )}
                            >
                              <item.icon className="h-5 w-5" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.name}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ) : (
                  // Mode étendu: afficher les groupes collapsibles
                  <Collapsible
                    open={openGroups.includes(group.title)}
                    onOpenChange={() => toggleGroup(group.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
                        {group.title}
                        <ChevronDown
                          className={cn(
                            'h-3 w-3 transition-transform',
                            openGroups.includes(group.title) && 'rotate-180',
                          )}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 mt-1">
                      {group.items.map((item) => {
                        const isActive = isItemActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              isActive
                                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                : 'text-sidebar-foreground',
                            )}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </Link>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-3">
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <Avatar className="h-8 w-8">
                {user.avatarUrl ? (
                  <AvatarImage src={resolveAvatarUrl(user.avatarUrl)} alt={userName} />
                ) : null}
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
      </div>
    </TooltipProvider>
  );
}
