'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Moon, Sun, User, LogOut, Menu, History, FileText, Calendar, Image as ImageIcon, Users } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatDateTime } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { audit, type AuditLog } from '@/lib/api';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onOpenMobileNav?: () => void;
}

const breadcrumbMap: Record<string, string> = {
  '/': 'Tableau de bord',
  '/content/articles': 'Actualités',
  '/content/events': 'Événements',
  '/media': 'Médias',
  '/newsletters': 'Newsletters',
  '/flash-infos': 'Flash infos',
  '/mairie/horaires': 'Horaires d\'ouverture',
  '/mairie/conseil': 'Conseil municipal',
  '/mairie/services': 'Services municipaux',
  '/annuaire': 'Commerces et entreprises',
  '/vie-quotidienne/infos-pratiques': 'Infos pratiques',
  '/vie-quotidienne/ecole-enfance': 'École et enfance',
  '/vie-quotidienne/restauration': 'Restauration scolaire',
  '/transports': 'Transports',
  '/culture-loisirs/centre-loisirs': 'Centre de loisirs',
  '/culture-loisirs/associations': 'Associations',
  '/culture-loisirs/sports': 'Sports',
  '/culture-loisirs/bibliotheque': 'Bibliothèque',
  '/audit': 'Historique',
  '/administration/export-import': 'Export/Import',
  '/settings': 'Paramètres',
};

const actionLabels: Record<string, { label: string; color: string }> = {
  CREATE: { label: 'Création', color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
  UPDATE: { label: 'Modification', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  DELETE: { label: 'Suppression', color: 'bg-red-500/10 text-red-700 dark:text-red-400' },
  PUBLISH: { label: 'Publication', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400' },
  ARCHIVE: { label: 'Archivage', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
  LOGIN: { label: 'Connexion', color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400' },
};

const entityIcons: Record<string, React.ElementType> = {
  Article: FileText,
  Event: Calendar,
  Media: ImageIcon,
  User: Users,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const resolveAvatarUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_URL}${url}`;
};

export function Header({ sidebarCollapsed, onOpenMobileNav }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [notifications, setNotifications] = React.useState<AuditLog[]>([]);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [hasNewNotifications, setHasNewNotifications] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const logs = await audit.list();
      setNotifications(logs.slice(0, 5));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNotificationClick = (log: AuditLog) => {
    setNotificationsOpen(false);
    router.push('/audit');
  };

  const handleViewAllNotifications = () => {
    setNotificationsOpen(false);
    setHasNewNotifications(false);
    router.push('/audit');
  };

  const userInitials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'AD';
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';
  const userEmail = user?.email ?? '';

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Accueil', href: '/' }];
    const skippedSegments = new Set(['content', 'mairie', 'vie-quotidienne', 'culture-loisirs', 'administration']);

    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      if (skippedSegments.has(segment)) {
        continue;
      }
      const name = breadcrumbMap[currentPath] || segment;
      breadcrumbs.push({ name, href: currentPath });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 transition-[left] duration-200',
        'left-0',
        sidebarCollapsed ? 'lg:left-[72px]' : 'lg:left-64',
      )}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm min-w-0">
        {onOpenMobileNav && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobileNav}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Ouvrir la navigation</span>
          </Button>
        )}
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            {index > 0 && (
              <span className="text-muted-foreground">/</span>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-foreground truncate max-w-[140px] sm:max-w-none">
                {crumb.name}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-none"
              >
                {crumb.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Changer le thème</span>
          </Button>
        )}

        {/* Notifications */}
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {hasNewNotifications && notifications.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="font-semibold">Activité récente</h4>
              <Badge variant="secondary" className="text-xs">
                {notifications.length} nouvelles
              </Badge>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <History className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((log) => {
                    const actionInfo = actionLabels[log.action] || {
                      label: log.action,
                      color: 'bg-gray-500/10 text-gray-700',
                    };
                    const Icon = (log.entityType ? entityIcons[log.entityType] : undefined) || History;
                    const userName = log.user
                      ? `${log.user.firstName} ${log.user.lastName}`
                      : 'Système';

                    return (
                      <button
                        key={log.id}
                        onClick={() => handleNotificationClick(log)}
                        className="w-full flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{userName}</span>
                            <Badge variant="outline" className={cn('text-xs', actionInfo.color)}>
                              {actionInfo.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {(log.entityTitle || log.entityType || 'Contenu')} • {formatDateTime(log.createdAt)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="border-t p-2">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm"
                onClick={handleViewAllNotifications}
              >
                Voir tout l&apos;historique
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {user?.avatarUrl ? (
                  <AvatarImage src={resolveAvatarUrl(user.avatarUrl)} alt={userName} />
                ) : null}
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Mon profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function Settings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
