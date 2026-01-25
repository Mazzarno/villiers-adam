'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Search,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { audit, type AuditLog } from '@/lib/api';
import { formatDateTime, getInitials } from '@/lib/utils';

const actionLabels: Record<string, { label: string; color: string }> = {
  CREATE: { label: 'Création', color: 'bg-green-500/10 text-green-700' },
  UPDATE: { label: 'Modification', color: 'bg-blue-500/10 text-blue-700' },
  DELETE: { label: 'Suppression', color: 'bg-red-500/10 text-red-700' },
  PUBLISH: { label: 'Publication', color: 'bg-purple-500/10 text-purple-700' },
  ARCHIVE: { label: 'Archivage', color: 'bg-orange-500/10 text-orange-700' },
  LOGIN: { label: 'Connexion', color: 'bg-cyan-500/10 text-cyan-700' },
  LOGOUT: { label: 'Déconnexion', color: 'bg-gray-500/10 text-gray-700' },
};

const entityLabels: Record<string, string> = {
  Page: 'Page',
  Article: 'Actualité',
  Event: 'Événement',
  Media: 'Média',
  User: 'Utilisateur',
  Settings: 'Paramètres',
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export default function AuditPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterAction, setFilterAction] = React.useState<string>('all');
  const [filterEntity, setFilterEntity] = React.useState<string>('all');

  React.useEffect(() => {
    loadLogs();
  }, [filterAction, filterEntity]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (filterAction !== 'all') params.action = filterAction;
      if (filterEntity !== 'all') params.entityType = filterEntity;
      const result = await audit.list(params);
      setLogs(result);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = React.useMemo(() => {
    if (!searchQuery) return logs;
    return logs.filter(
      (log) =>
        log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [logs, searchQuery]);

  const groupedLogs = React.useMemo(() => {
    const groups: Record<string, AuditLog[]> = {};
    filteredLogs.forEach((log) => {
      const date = new Date(log.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return groups;
  }, [filteredLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Historique</h1>
        <p className="text-muted-foreground">
          Consultez l&apos;historique de toutes les modifications
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les actions</SelectItem>
            <SelectItem value="CREATE">Création</SelectItem>
            <SelectItem value="UPDATE">Modification</SelectItem>
            <SelectItem value="DELETE">Suppression</SelectItem>
            <SelectItem value="PUBLISH">Publication</SelectItem>
            <SelectItem value="ARCHIVE">Archivage</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="Page">Pages</SelectItem>
            <SelectItem value="Article">Actualités</SelectItem>
            <SelectItem value="Event">Événements</SelectItem>
            <SelectItem value="Media">Médias</SelectItem>
            <SelectItem value="User">Utilisateurs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <History className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucune activité</h3>
            <p className="text-muted-foreground mt-1">
              L&apos;historique est vide pour les filtres sélectionnés
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedLogs).map(([date, logs]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                {new Date(date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {logs.map((log) => {
                  const actionInfo = actionLabels[log.action] || {
                    label: log.action,
                    color: 'bg-gray-500/10 text-gray-700',
                  };
                  const hasChanges = Boolean(log.changes);
                  const userName = log.user
                    ? `${log.user.firstName} ${log.user.lastName}`
                    : 'Système';

                  return (
                    <motion.div
                      key={log.id}
                      variants={item}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {log.user ? getInitials(userName) : 'SY'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{userName}</span>
                          <Badge variant="outline" className={actionInfo.color}>
                            {actionInfo.label}
                          </Badge>
                          <Badge variant="secondary">
                            {entityLabels[log.entityType] || log.entityType}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          ID: {log.entityId}
                        </p>
                        {hasChanges && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 h-auto p-0 text-primary"
                              >
                                Voir les modifications
                                <ChevronDown className="ml-1 h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96">
                              <pre className="text-xs overflow-auto max-h-64">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
