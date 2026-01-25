'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, ArrowUpDown, Pencil, Trash2, Archive, Send, Bus } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/content/data-table';
import { StatusBadge } from '@/components/content/status-badge';
import { MediaPicker } from '@/components/media/media-picker';
import { transports, type TransportInfo, type Media } from '@/lib/api';
import { formatDate, slugify } from '@/lib/utils';

const statusOptions = [
  { label: 'Brouillon', value: 'DRAFT' },
  { label: 'Programmé', value: 'SCHEDULED' },
  { label: 'Publié', value: 'PUBLISHED' },
  { label: 'Archivé', value: 'ARCHIVED' },
];

type FormData = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  operator: string;
  website: string;
  phone: string;
  status: string;
  coverMediaId?: string;
};

const defaultFormData: FormData = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  operator: '',
  website: '',
  phone: '',
  status: 'DRAFT',
};

export default function TransportsPage() {
  const [data, setData] = React.useState<TransportInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<FormData>(defaultFormData);
  const [isSaving, setIsSaving] = React.useState(false);
  const [coverMedia, setCoverMedia] = React.useState<Media | null>(null);
  const [showMediaPicker, setShowMediaPicker] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await transports.list();
      setData(result);
    } catch (error) {
      console.error('Failed to load transports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setCoverMedia(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: TransportInfo) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      slug: item.slug,
      summary: item.summary || '',
      content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content),
      operator: item.operator || '',
      website: item.website || '',
      phone: item.phone || '',
      status: item.status,
      coverMediaId: item.coverMediaId || undefined,
    });
    setCoverMedia(item.coverMedia ?? null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        slug: formData.slug ? slugify(formData.slug) : undefined,
        content: formData.content || '',
        coverMediaId: formData.coverMediaId || null,
      };

      if (editingId) {
        await transports.update(editingId, payload);
      } else {
        await transports.create(payload);
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await transports.publish(id);
      loadData();
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await transports.archive(id);
      loadData();
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette fiche transport ?')) return;
    try {
      await transports.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const columns: ColumnDef<TransportInfo>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Titre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          {row.original.operator && (
            <p className="text-sm text-muted-foreground">{row.original.operator}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Màj',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.updatedAt)}</span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const info = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Actions</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEdit(info)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {info.status === 'DRAFT' && (
                <DropdownMenuItem onClick={() => handlePublish(info.id)}>
                  <Send className="mr-2 h-4 w-4" />
                  Publier
                </DropdownMenuItem>
              )}
              {info.status === 'PUBLISHED' && (
                <DropdownMenuItem onClick={() => handleArchive(info.id)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archiver
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(info.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transports</h1>
          <p className="text-muted-foreground">Gérez les informations de transport public.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <DataTable columns={columns} data={data} searchKey="title" isLoading={isLoading} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier' : 'Nouvelle'} fiche transport</DialogTitle>
            <DialogDescription>Décrivez les lignes, horaires et opérateurs.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Titre</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="transports-publics"
              />
            </div>

            <div className="grid gap-2">
              <Label>Résumé</Label>
              <Textarea
                rows={2}
                value={formData.summary}
                onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label>Contenu</Label>
              <Textarea
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Décrivez les lignes, horaires, contacts..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Opérateur</Label>
                <Input
                  value={formData.operator}
                  onChange={(e) => setFormData((prev) => ({ ...prev, operator: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Site web</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Téléphone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Visuel</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setShowMediaPicker(true)}>
                  <Bus className="mr-2 h-4 w-4" />
                  Choisir un média
                </Button>
                {coverMedia && (
                  <span className="text-xs text-muted-foreground">{coverMedia.filename}</span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaPicker
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        onSelect={(media) => {
          setCoverMedia(media);
          setFormData((prev) => ({ ...prev, coverMediaId: media.id }));
        }}
        accept={['image/*']}
      />
    </div>
  );
}
