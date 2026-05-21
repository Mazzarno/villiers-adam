'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Newspaper,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Image,
  Users,
  ClipboardList,
  BusFront,
  Briefcase,
  Landmark,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import {
  articles,
  events,
  audit,
  media,
  annuaire,
  procedures,
  municipalServices,
  transports,
  council,
  type Article,
  type Event,
  type AuditLog,
  type DirectoryEntry,
  type Procedure,
  type MunicipalService,
  type TransportInfo,
  type CouncilMember,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const quickActions = [
  { name: 'Nouvelle actualité', href: '/content/articles/new', icon: Newspaper },
  { name: 'Nouvel événement', href: '/content/events/new', icon: Calendar },
  { name: 'Accéder à l\'annuaire', href: '/annuaire', icon: Users },
  { name: 'Ajouter un média', href: '/media?upload=true', icon: Plus },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type Stats = {
  articlesPublished: number;
  articlesDraft: number;
  eventsUpcoming: number;
  mediaCount: number;
  directoryCount: number;
};

type PendingContent = {
  id: string;
  type: 'article' | 'event' | 'directory' | 'procedure' | 'municipalService' | 'transport' | 'council';
  title: string;
  status: string;
  updatedAt: string;
};

const actionLabels: Record<string, string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
  LOGIN: 'Connexion',
  LOGOUT: 'Déconnexion',
  PUBLISH: 'Publication',
  ARCHIVE: 'Archivage',
  RESTORE: 'Restauration',
};

const entityLabels: Record<string, string> = {
  Page: 'page',
  Article: 'actualité',
  Event: 'événement',
  Media: 'média',
  DirectoryEntry: 'annuaire',
  Procedure: 'démarche',
  CouncilMember: 'conseil municipal',
  MunicipalService: 'service municipal',
  TransportInfo: 'transport',
  Settings: 'paramètres',
  User: 'utilisateur',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
  const [recentActivity, setRecentActivity] = React.useState<AuditLog[]>([]);
  const [pendingContent, setPendingContent] = React.useState<PendingContent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        const [
          articlesList,
          eventsList,
          auditList,
          mediaList,
          directoryList,
          proceduresList,
          municipalServicesList,
          transportsList,
          councilList,
        ] = await Promise.all([
          articles.list().catch(() => [] as Article[]),
          events.list().catch(() => [] as Event[]),
          audit.list().catch(() => [] as AuditLog[]),
          media.list().catch(() => []),
          annuaire.list().catch(() => [] as DirectoryEntry[]),
          procedures.list().catch(() => [] as Procedure[]),
          municipalServices.list().catch(() => [] as MunicipalService[]),
          transports.list().catch(() => [] as TransportInfo[]),
          council.list().catch(() => [] as CouncilMember[]),
        ]);

        const now = new Date();
        const articlesPublished = articlesList.filter((a: Article) => a.status === 'PUBLISHED').length;
        const articlesDraft = articlesList.filter((a: Article) => a.status === 'DRAFT').length;
        const eventsUpcoming = eventsList.filter(
          (e: Event) => e.status === 'PUBLISHED' && new Date(e.startsAt) > now
        ).length;

        setStats({
          articlesPublished,
          articlesDraft,
          eventsUpcoming,
          mediaCount: mediaList.length,
          directoryCount: directoryList.length,
        });

        setAuditLogs(auditList);
        setRecentActivity(auditList.slice(0, 5));

        const pending: PendingContent[] = [
          ...articlesList
            .filter((a: Article) => a.status === 'DRAFT' || a.status === 'SCHEDULED')
            .map((a: Article) => ({
              id: a.id,
              type: 'article' as const,
              title: a.title,
              status: a.status,
              updatedAt: a.updatedAt,
            })),
          ...eventsList
            .filter((e: Event) => e.status === 'DRAFT' || e.status === 'SCHEDULED')
            .map((e: Event) => ({
              id: e.id,
              type: 'event' as const,
              title: e.title,
              status: e.status,
              updatedAt: e.updatedAt,
            })),
          ...directoryList
            .filter((entry: DirectoryEntry) => entry.status === 'DRAFT' || entry.status === 'SCHEDULED')
            .map((entry: DirectoryEntry) => ({
              id: entry.id,
              type: 'directory' as const,
              title: entry.name,
              status: entry.status,
              updatedAt: entry.createdAt,
            })),
          ...proceduresList
            .filter((procedure: Procedure) => procedure.status === 'DRAFT' || procedure.status === 'SCHEDULED')
            .map((procedure: Procedure) => ({
              id: procedure.id,
              type: 'procedure' as const,
              title: procedure.title,
              status: procedure.status,
              updatedAt: procedure.updatedAt,
            })),
          ...municipalServicesList
            .filter((service: MunicipalService) => service.status === 'DRAFT' || service.status === 'SCHEDULED')
            .map((service: MunicipalService) => ({
              id: service.id,
              type: 'municipalService' as const,
              title: service.name,
              status: service.status,
              updatedAt: service.updatedAt,
            })),
          ...transportsList
            .filter((transport: TransportInfo) => transport.status === 'DRAFT' || transport.status === 'SCHEDULED')
            .map((transport: TransportInfo) => ({
              id: transport.id,
              type: 'transport' as const,
              title: transport.title,
              status: transport.status,
              updatedAt: transport.updatedAt,
            })),
          ...councilList
            .filter((member: CouncilMember) => member.status === 'DRAFT' || member.status === 'SCHEDULED')
            .map((member: CouncilMember) => ({
              id: member.id,
              type: 'council' as const,
              title: member.name,
              status: member.status,
              updatedAt: member.updatedAt,
            })),
        ]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);

        setPendingContent(pending);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statsConfig = [
    {
      name: 'Actualités',
      value: stats?.articlesPublished ?? 0,
      subtitle: `${stats?.articlesDraft ?? 0} brouillon(s)`,
      icon: Newspaper,
    },
    {
      name: 'Événements à venir',
      value: stats?.eventsUpcoming ?? 0,
      subtitle: 'publiés',
      icon: Calendar,
    },
    {
      name: 'Annuaire',
      value: stats?.directoryCount ?? 0,
      subtitle: 'entrées',
      icon: Users,
    },
    {
      name: 'Médias',
      value: stats?.mediaCount ?? 0,
      subtitle: 'fichiers',
      icon: Image,
    },
  ];

  const activitySeries = React.useMemo(() => {
    const formatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      return { key, label: formatter.format(date), count: 0 };
    });

    const indexByKey = new Map(days.map((day, idx) => [day.key, idx]));
    auditLogs.forEach((log) => {
      const date = new Date(log.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      const idx = indexByKey.get(key);
      if (idx !== undefined) {
        days[idx].count += 1;
      }
    });

    return days;
  }, [auditLogs]);

  const maxActivityCount = Math.max(1, ...activitySeries.map((day) => day.count));

  const getEditUrl = (content: PendingContent) => {
    switch (content.type) {
      case 'article':
        return `/content/articles/${content.id}`;
      case 'event':
        return `/content/events/${content.id}`;
      case 'directory':
        return `/annuaire?search=${encodeURIComponent(content.title)}`;
      case 'procedure':
        return `/demarches?search=${encodeURIComponent(content.title)}`;
      case 'municipalService':
        return `/mairie/services?search=${encodeURIComponent(content.title)}`;
      case 'transport':
        return `/transports?search=${encodeURIComponent(content.title)}`;
      case 'council':
        return `/mairie/conseil?search=${encodeURIComponent(content.title)}`;
    }
  };

  const getTypeLabel = (type: PendingContent['type']) => {
    switch (type) {
      case 'article':
        return 'Actualité';
      case 'event':
        return 'Événement';
      case 'directory':
        return 'Annuaire';
      case 'procedure':
        return 'Démarche';
      case 'municipalService':
        return 'Service municipal';
      case 'transport':
        return 'Transport';
      case 'council':
        return 'Conseil municipal';
    }
  };

  const getTypeIcon = (type: PendingContent['type']) => {
    switch (type) {
      case 'article':
        return Newspaper;
      case 'event':
        return Calendar;
      case 'directory':
        return Users;
      case 'procedure':
        return ClipboardList;
      case 'municipalService':
        return Briefcase;
      case 'transport':
        return BusFront;
      case 'council':
        return Landmark;
    }
  };

  const getEntityUrl = (activity: AuditLog) => {
    switch (activity.entityType) {
      case 'Article':
        return activity.entityId ? `/content/articles/${activity.entityId}` : undefined;
      case 'Event':
        return activity.entityId ? `/content/events/${activity.entityId}` : undefined;
      case 'Media':
        return '/media';
      case 'DirectoryEntry':
        return '/annuaire';
      case 'Procedure':
        return '/demarches';
      case 'CouncilMember':
        return '/mairie/conseil';
      case 'MunicipalService':
        return '/mairie/services';
      case 'TransportInfo':
        return '/transports';
      case 'Settings':
        return '/settings';
      case 'User':
        return '/settings';
      default:
        return undefined;
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue{user ? `, ${user.firstName}` : ''} sur l&apos;espace d&apos;administration de Villiers-Adam
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>
                Créez du nouveau contenu en un clic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.name}
                    variant="outline"
                    className="h-auto flex-col gap-2 py-4"
                    asChild
                  >
                    <Link href={action.href}>
                      <action.icon className="h-5 w-5" />
                      <span className="text-sm">{action.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>
                  Les dernières modifications effectuées
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/audit">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune activité récente
                </p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const url = getEntityUrl(activity);
                    const content = (
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {actionLabels[activity.action] || activity.action}{' '}
                            {activity.entityType && (
                              <span className="text-muted-foreground">
                                d&apos;une {entityLabels[activity.entityType] || activity.entityType}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.entityTitle || activity.entityId || '—'}
                            {' · '}
                            {activity.user?.firstName} {activity.user?.lastName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(new Date(activity.createdAt))}
                          </span>
                        </div>
                      </div>
                    );

                    return url ? (
                      <Link key={activity.id} href={url} className="block rounded-lg hover:bg-muted/50 p-2 -m-2">
                        {content}
                      </Link>
                    ) : (
                      <div key={activity.id}>{content}</div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Activité sur 7 jours</CardTitle>
            <CardDescription>Suivi du volume d&apos;actions dans l&apos;admin.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-end gap-2 h-28">
                  {activitySeries.map((day) => (
                    <div key={day.key} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full rounded-md bg-muted/60 h-full flex items-end">
                        <div
                          className="w-full rounded-md bg-primary/70 transition-all"
                          style={{ height: `${(day.count / maxActivityCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {activitySeries.map((day) => (
                    <span key={`${day.key}-label`} className="flex-1 text-center">
                      {day.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending Items */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>En attente de validation</CardTitle>
            <CardDescription>
              Contenus en brouillon ou en attente de publication
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-5 w-5" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingContent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun contenu en attente
              </p>
            ) : (
              <div className="space-y-4">
                {pendingContent.map((content) => {
                  const Icon = getTypeIcon(content.type);
                  return (
                    <div
                      key={`${content.type}-${content.id}`}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{content.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {getTypeLabel(content.type)} · Modifié {formatRelativeTime(new Date(content.updatedAt))}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={content.status === 'DRAFT' ? 'warning' : 'info'}>
                          {content.status === 'DRAFT' ? 'Brouillon' : 'Programmé'}
                        </Badge>
                        <Button size="sm" asChild>
                          <Link href={getEditUrl(content)}>Éditer</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
