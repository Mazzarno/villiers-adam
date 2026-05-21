'use client';

import * as React from 'react';
import { Zap, Plus, Trash2, MoreHorizontal, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { articles } from '@/lib/api';

type FlashInfo = {
  id: string;
  articleId: string;
  articleTitle: string;
  isActive: boolean;
  order: number;
};

export default function FlashInfosPage() {
  const [flashInfos, setFlashInfos] = React.useState<FlashInfo[]>([]);
  const [availableArticles, setAvailableArticles] = React.useState<{ id: string; title: string }[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedArticleId, setSelectedArticleId] = React.useState('');
  const [formError, setFormError] = React.useState('');

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger les articles flash
      const articlesList = await articles.list({ isFlash: true });
      const flashes = articlesList.map((a, index) => ({
        id: a.id,
        articleId: a.id,
        articleTitle: a.title,
        isActive: a.isFlash,
        order: index,
      }));
      setFlashInfos(flashes);

      // Charger tous les articles publiés pour le sélecteur
      const allArticles = await articles.list();
      setAvailableArticles(allArticles.map((a) => ({ id: a.id, title: a.title })));
    } catch (error) {
      console.error('Failed to load flash infos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const item = flashInfos.find((f) => f.id === id);
      if (!item) return;
      await articles.update(id, { isFlash: !item.isActive });
      await loadData();
    } catch (error) {
      console.error('Failed to update flash info:', error);
    }
  };

  const removeFlash = async (id: string) => {
    try {
      await articles.update(id, { isFlash: false });
      await loadData();
    } catch (error) {
      console.error('Failed to remove flash info:', error);
    }
  };

  const handleAddFlash = async () => {
    setFormError('');
    if (!selectedArticleId) {
      setFormError('Sélectionnez une actualité.');
      return;
    }
    try {
      await articles.update(selectedArticleId, { isFlash: true });
      setSelectedArticleId('');
      setDialogOpen(false);
      await loadData();
    } catch (error) {
      setFormError('Impossible d\'ajouter le flash info.');
      console.error('Failed to add flash info:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flash Infos</h1>
          <p className="text-muted-foreground">
            Gérez les actualités affichées dans le bandeau flash du site
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un flash
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Flash infos actifs
          </CardTitle>
          <CardDescription>
            Ces actualités apparaissent dans le bandeau en haut du site public
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : flashInfos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Zap className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Aucun flash info configuré</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez une actualité au bandeau flash pour informer vos visiteurs
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {flashInfos.map((flash) => (
                <div
                  key={flash.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={flash.isActive}
                      onCheckedChange={() => toggleActive(flash.id)}
                    />
                    <div>
                      <p className="font-medium">{flash.articleTitle}</p>
                      <Badge variant={flash.isActive ? 'default' : 'secondary'}>
                        {flash.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleActive(flash.id)}>
                        {flash.isActive ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Activer
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => removeFlash(flash.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Retirer du flash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un flash info</DialogTitle>
            <DialogDescription>
              Sélectionnez une actualité à afficher dans le bandeau flash
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label>Actualité</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedArticleId}
                onChange={(e) => setSelectedArticleId(e.target.value)}
              >
                <option value="">Sélectionner une actualité</option>
                {availableArticles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddFlash}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
