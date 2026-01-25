'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, ArrowUpDown, Pencil, Trash2, Archive, Send, Briefcase } from 'lucide-react';
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
import { municipalServices, type MunicipalService, type Media } from '@/lib/api';
import { formatDate, slugify } from '@/lib/utils';

const statusOptions = [
  { label: 'Brouillon', value: 'DRAFT' },
  { label: 'Programmé', value: 'SCHEDULED' },
  { label: 'Publié', value: 'PUBLISHED' },
  { label: 'Archivé', value: 'ARCHIVED' },
];

type FormData = {
  name: string;
  slug: string;
  description: string;
  category: string;
  openingHours: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  order: number;
  status: string;
  coverMediaId?: string;
};

const defaultFormData: FormData = {
  name: '',
  slug: '',
  description: '',
  category: '',
  openingHours: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  order: 0,
  status: 'DRAFT',
};

export default function ServicesMunicipauxPage() {
  const [data, setData] = React.useState<MunicipalService[]>([]);
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
      const result = await municipalServices.list();
      setData(result);
    } catch (error) {
      console.error('Failed to load municipal services:', error);
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

  const handleEdit = (item: MunicipalService) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      category: item.category || '',
      openingHours: item.openingHours ? JSON.stringify(item.openingHours, null, 2) : '',
      address: item.address || '',
      phone: item.phone || '',
      email: item.email || '',
      website: item.website || '',
      order: item.order ?? 0,
      status: item.status,
      coverMediaId: item.coverMediaId || undefined,
    });
    setCoverMedia(item.coverMedia ?? null);
    setDialogOpen(true);
  };

  const parseOpeningHours = () => {
    if (!formData.openingHours) return null;
    try {
      return JSON.parse(formData.openingHours);
    } catch {
      return formData.openingHours;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        slug: formData.slug ? slugify(formData.slug) : undefined,
        openingHours: parseOpeningHours(),
        order: Number.isNaN(formData.order) ? 0 : formData.order,
        coverMediaId: formData.coverMediaId || null,
      };

      if (editingId) {
        await municipalServices.update(editingId, payload);
      } else {
        await municipalServices.create(payload);
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
      await municipalServices.publish(id);
      loadData();
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await municipalServices.archive(id);
      loadData();
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce service ?')) return;
    try {
      await municipalServices.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const columns: ColumnDef<MunicipalService>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.category && (
            <p className="text-sm text-muted-foreground">{row.original.category}</p>
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
        const service = row.original;
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
              <DropdownMenuItem onClick={() => handleEdit(service)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {service.status === 'DRAFT' && (
                <DropdownMenuItem onClick={() => handlePublish(service.id)}>
                  <Send className="mr-2 h-4 w-4" />
                  Publier
                </DropdownMenuItem>
              )}
              {service.status === 'PUBLISHED' && (
                <DropdownMenuItem onClick={() => handleArchive(service.id)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archiver
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(service.id)}
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
          <h1 className="text-3xl font-bold tracking-tight">Services municipaux</h1>
          <p className="text-muted-foreground">Gérez les services de la mairie.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <DataTable columns={columns} data={data} searchKey="name" isLoading={isLoading} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier' : 'Nouveau'} service</DialogTitle>
            <DialogDescription>Renseignez les informations affichées sur le site.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nom</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="services-postaux"
              />
            </div>

            <div className="grid gap-2">
              <Label>Catégorie</Label>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="État civil, Urbanisme..."
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Horaires (JSON ou texte)</Label>
              <Textarea
                rows={4}
                value={formData.openingHours}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, openingHours: e.target.value }))
                }
                placeholder='{"Lundi":"9h-12h"}'
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Téléphone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Adresse</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Site web</Label>
                <Input
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, website: e.target.value }))
                  }
                  placeholder="https://"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Ordre</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))
                  }
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
                  <Briefcase className="mr-2 h-4 w-4" />
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
