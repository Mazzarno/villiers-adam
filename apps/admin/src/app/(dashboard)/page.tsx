'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Newspaper,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Image,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import { pages, articles, events, audit, media, type Page, type Article, type Event, type AuditLog } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const quickActions = [
  { name: 'Nouvelle actualité', href: '/content/articles/new', icon: Newspaper },
  { name: 'Nouvel événement', href: '/content/events/new', icon: Calendar },
  { name: 'Nouvelle page', href: '/content/pages/new', icon: FileText },
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
  pagesPublished: number;
  pagesDraft: number;
  articlesPublished: number;
  articlesDraft: number;
  eventsUpcoming: number;
  mediaCount: number;
};

type PendingContent = {
  id: string;
  type: 'page' | 'article' | 'event';
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
  User: 'utilisateur',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = React.useState<AuditLog[]>([]);
  const [pendingContent, setPendingContent] = React.useState<PendingContent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        const [pagesList, articlesList, eventsList, auditList, mediaList] = await Promise.all([
          pages.list().catch(() => [] as Page[]),
          articles.list().catch(() => [] as Article[]),
          events.list().catch(() => [] as Event[]),
          audit.list().catch(() => [] as AuditLog[]),
          media.list().catch(() => []),
        ]);

        const now = new Date();
        const pagesPublished = pagesList.filter((p) => p.status === 'PUBLISHED').length;
        const pagesDraft = pagesList.filter((p) => p.status === 'DRAFT').length;
        const articlesPublished = articlesList.filter((a) => a.status === 'PUBLISHED').length;
        const articlesDraft = articlesList.filter((a) => a.status === 'DRAFT').length;
        const eventsUpcoming = eventsList.filter(
          (e) => e.status === 'PUBLISHED' && new Date(e.startsAt) > now
        ).length;

        setStats({
          pagesPublished,
          pagesDraft,
          articlesPublished,
          articlesDraft,
          eventsUpcoming,
          mediaCount: mediaList.length,
        });

        setRecentActivity(auditList.slice(0, 5));

        const pending: PendingContent[] = [
          ...pagesList
            .filter((p) => p.status === 'DRAFT' || p.status === 'SCHEDULED')
            .map((p) => ({
              id: p.id,
              type: 'page' as const,
              title: p.title,
              status: p.status,
              updatedAt: p.updatedAt,
            })),
          ...articlesList
            .filter((a) => a.status === 'DRAFT' || a.status === 'SCHEDULED')
            .map((a) => ({
              id: a.id,
              type: 'article' as const,
              title: a.title,
              status: a.status,
              updatedAt: a.updatedAt,
            })),
          ...eventsList
            .filter((e) => e.status === 'DRAFT' || e.status === 'SCHEDULED')
            .map((e) => ({
              id: e.id,
              type: 'event' as const,
              title: e.title,
              status: e.status,
              updatedAt: e.updatedAt,
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
      name: 'Pages publiées',
      value: stats?.pagesPublished ?? 0,
      subtitle: `${stats?.pagesDraft ?? 0} brouillon(s)`,
      icon: FileText,
    },
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
      name: 'Médias',
      value: stats?.mediaCount ?? 0,
      subtitle: 'fichiers',
      icon: Image,
    },
  ];

  const getEditUrl = (content: PendingContent) => {
    switch (content.type) {
      case 'page':
        return `/content/pages/${content.id}`;
      case 'article':
        return `/content/articles/${content.id}`;
      case 'event':
        return `/content/events/${content.id}`;
    }
  };

  const getTypeLabel = (type: PendingContent['type']) => {
    switch (type) {
      case 'page':
        return 'Page';
      case 'article':
        return 'Actualité';
      case 'event':
        return 'Événement';
    }
  };

  const getTypeIcon = (type: PendingContent['type']) => {
    switch (type) {
      case 'page':
        return FileText;
      case 'article':
        return Newspaper;
      case 'event':
        return Calendar;
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
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start justify-between gap-4"
                    >
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
                          par {activity.user?.firstName} {activity.user?.lastName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(new Date(activity.createdAt))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
