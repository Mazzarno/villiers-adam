'use client';

import * as React from 'react';
import { Download, Mail, Plus, Trash2, Users, CheckCircle, XCircle, Clock, Tag, Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  newsletters,
  type NewsletterSubscription,
  type NewsletterTopic,
  type NewsletterStats,
} from '@/lib/api';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function NewslettersPage() {
  const [subscriptions, setSubscriptions] = React.useState<NewsletterSubscription[]>([]);
  const [topics, setTopics] = React.useState<NewsletterTopic[]>([]);
  const [stats, setStats] = React.useState<NewsletterStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>('');

  // Topic dialog
  const [topicDialogOpen, setTopicDialogOpen] = React.useState(false);
  const [editingTopic, setEditingTopic] = React.useState<NewsletterTopic | null>(null);
  const [topicName, setTopicName] = React.useState('');
  const [topicDescription, setTopicDescription] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [subs, allTopics, statsData] = await Promise.all([
        newsletters.subscriptions(statusFilter ? { status: statusFilter } : undefined),
        newsletters.topics({ admin: true }),
        newsletters.stats(),
      ]);
      setSubscriptions(subs);
      setTopics(allTopics);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load newsletter data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const handleSaveTopic = async () => {
    if (!topicName.trim()) return;
    setIsSaving(true);
    try {
      if (editingTopic) {
        await newsletters.updateTopic(editingTopic.id, {
          name: topicName,
          slug: slugify(topicName),
          description: topicDescription || undefined,
        });
      } else {
        await newsletters.createTopic({
          name: topicName,
          slug: slugify(topicName),
          description: topicDescription || undefined,
        });
      }
      setTopicDialogOpen(false);
      setEditingTopic(null);
      setTopicName('');
      setTopicDescription('');
      await loadData();
    } catch (error) {
      console.error('Failed to save topic:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Supprimer ce topic ?')) return;
    try {
      await newsletters.deleteTopic(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
  };

  const handleToggleTopic = async (topic: NewsletterTopic) => {
    try {
      await newsletters.updateTopic(topic.id, { isActive: !topic.isActive });
      await loadData();
    } catch (error) {
      console.error('Failed to toggle topic:', error);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await newsletters.exportCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abonnes-newsletter-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  const getStatusBadge = (sub: NewsletterSubscription) => {
    if (sub.unsubscribedAt) return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Désabonné</Badge>;
    if (sub.confirmedAt) return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> Confirmé</Badge>;
    return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Non confirmé</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletters</h1>
          <p className="text-muted-foreground">
            Gérez les abonnés et les topics de la newsletter
          </p>
        </div>
        <Button onClick={handleExportCsv} variant="outline" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">abonnés inscrits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.confirmed ?? 0}</div>
            <p className="text-xs text-muted-foreground">abonnés actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unconfirmed ?? 0}</div>
            <p className="text-xs text-muted-foreground">non confirmés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Désabonnés</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unsubscribed ?? 0}</div>
            <p className="text-xs text-muted-foreground">désabonnés</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscribers">
        <TabsList>
          <TabsTrigger value="subscribers">Abonnés</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-4">
          <div className="flex gap-2">
            {['', 'confirmed', 'unconfirmed', 'unsubscribed'].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s === '' ? 'Tous' : s === 'confirmed' ? 'Confirmés' : s === 'unconfirmed' ? 'En attente' : 'Désabonnés'}
              </Button>
            ))}
          </div>

          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Aucun abonné</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{sub.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Inscrit le {new Date(sub.createdAt).toLocaleDateString('fr-FR')}
                            {sub.topics.length > 0 && (
                              <> · {sub.topics.map((t) => t.topic.name).join(', ')}</>
                            )}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(sub)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingTopic(null);
                setTopicName('');
                setTopicDescription('');
                setTopicDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau topic
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {topics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Tag className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Aucun topic créé</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Créez des topics pour catégoriser votre newsletter
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {topics.map((topic) => {
                    const topicStats = stats?.byTopic.find((t) => t.topicId === topic.id);
                    return (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={topic.isActive}
                            onCheckedChange={() => handleToggleTopic(topic)}
                          />
                          <div>
                            <p className="font-medium text-sm">{topic.name}</p>
                            {topic.description && (
                              <p className="text-xs text-muted-foreground">{topic.description}</p>
                            )}
                          </div>
                          <Badge variant="outline">{topicStats?.count ?? 0} abonnés</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingTopic(topic);
                              setTopicName(topic.name);
                              setTopicDescription(topic.description || '');
                              setTopicDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTopic(topic.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Topic Dialog */}
      <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTopic ? 'Modifier le topic' : 'Nouveau topic'}</DialogTitle>
            <DialogDescription>
              Les topics permettent aux abonnés de choisir les sujets qui les intéressent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="Ex: Actualités, Événements, Vie scolaire..."
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optionnel)</Label>
              <Input
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                placeholder="Courte description du topic"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopicDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveTopic} disabled={isSaving || !topicName.trim()}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingTopic ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
