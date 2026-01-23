'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Newspaper,
  Calendar,
  Users,
  Eye,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';

const stats = [
  {
    name: 'Pages publiées',
    value: '12',
    change: '+2',
    changeType: 'positive',
    icon: FileText,
  },
  {
    name: 'Actualités',
    value: '24',
    change: '+5',
    changeType: 'positive',
    icon: Newspaper,
  },
  {
    name: 'Événements à venir',
    value: '8',
    change: '+3',
    changeType: 'positive',
    icon: Calendar,
  },
  {
    name: 'Visiteurs ce mois',
    value: '1,234',
    change: '+12%',
    changeType: 'positive',
    icon: Eye,
  },
];

const recentActivity = [
  {
    id: '1',
    action: 'Nouvelle actualité publiée',
    title: 'Fermeture exceptionnelle de la mairie',
    user: 'Marie Dupont',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    action: 'Page modifiée',
    title: 'Horaires d\'ouverture',
    user: 'Jean Martin',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    action: 'Événement créé',
    title: 'Fête de la musique 2024',
    user: 'Marie Dupont',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '4',
    action: 'Média ajouté',
    title: 'photo-mairie-facade.jpg',
    user: 'Admin',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

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

export default function DashboardPage() {
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
          Bienvenue sur l&apos;espace d&apos;administration de Villiers-Adam
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    stat.changeType === 'positive'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }
                >
                  {stat.change}
                </span>{' '}
                par rapport au mois dernier
              </p>
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
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action} par {activity.user}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Nouveau règlement du cimetière</p>
                    <p className="text-sm text-muted-foreground">
                      Page · Brouillon · Modifié il y a 2 jours
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Brouillon</Badge>
                  <Button size="sm">Éditer</Button>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <Newspaper className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Travaux rue de la Fontaine</p>
                    <p className="text-sm text-muted-foreground">
                      Actualité · Programmé pour demain 9h
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">Programmé</Badge>
                  <Button size="sm">Éditer</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
