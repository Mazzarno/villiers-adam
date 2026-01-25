'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, ArrowUpDown, Pencil, Trash2, Archive, Send, Users } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { MediaPicker } from '@/components/media/media-picker';
import { council, type CouncilMember, type CouncilMemberRole, type Media } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const statusOptions = [
  { label: 'Brouillon', value: 'DRAFT' },
  { label: 'Programmé', value: 'SCHEDULED' },
  { label: 'Publié', value: 'PUBLISHED' },
  { label: 'Archivé', value: 'ARCHIVED' },
];

const roleOptions: { label: string; value: CouncilMemberRole }[] = [
  { label: 'Maire', value: 'MAIRE' },
  { label: 'Adjoint', value: 'ADJOINT' },
  { label: 'Conseiller', value: 'CONSEILLER' },
  { label: 'Conseiller délégué', value: 'CONSEILLER_DELEGUE' },
];

const roleLabels: Record<CouncilMemberRole, string> = {
  MAIRE: 'Maire',
  ADJOINT: 'Adjoint',
  CONSEILLER: 'Conseiller',
  CONSEILLER_DELEGUE: 'Conseiller délégué',
};

type FormData = {
  name: string;
  role: CouncilMemberRole;
  roleTitle: string;
  delegations: string;
  email: string;
  phone: string;
  order: number;
  status: string;
  photoMediaId?: string;
};

const defaultFormData: FormData = {
  name: '',
  role: 'CONSEILLER',
  roleTitle: '',
  delegations: '',
  email: '',
  phone: '',
  order: 0,
  status: 'DRAFT',
};

export default function ConseilPage() {
  const [data, setData] = React.useState<CouncilMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<FormData>(defaultFormData);
  const [isSaving, setIsSaving] = React.useState(false);
  const [photoMedia, setPhotoMedia] = React.useState<Media | null>(null);
  const [showMediaPicker, setShowMediaPicker] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await council.list();
      setData(result);
    } catch (error) {
      console.error('Failed to load council:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setPhotoMedia(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: CouncilMember) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      role: item.role,
      roleTitle: item.roleTitle || '',
      delegations: item.delegations || '',
      email: item.email || '',
      phone: item.phone || '',
      order: item.order ?? 0,
      status: item.status,
      photoMediaId: item.photoMediaId || undefined,
    });
    setPhotoMedia(item.photoMedia ?? null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        order: Number.isNaN(formData.order) ? 0 : formData.order,
        photoMediaId: formData.photoMediaId || null,
      };

      if (editingId) {
        await council.update(editingId, payload);
      } else {
        await council.create(payload);
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
      await council.publish(id);
      loadData();
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await council.archive(id);
      loadData();
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce membre du conseil ?')) return;
    try {
      await council.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const columns: ColumnDef<CouncilMember>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.roleTitle && (
            <p className="text-sm text-muted-foreground">{row.original.roleTitle}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Rôle',
      cell: ({ row }) => (
        <Badge variant="secondary">{roleLabels[row.original.role]}</Badge>
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
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.updatedAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const member = row.original;
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
              <DropdownMenuItem onClick={() => handleEdit(member)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {member.status === 'DRAFT' && (
                <DropdownMenuItem onClick={() => handlePublish(member.id)}>
                  <Send className="mr-2 h-4 w-4" />
                  Publier
                </DropdownMenuItem>
              )}
              {member.status === 'PUBLISHED' && (
                <DropdownMenuItem onClick={() => handleArchive(member.id)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archiver
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(member.id)}
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
          <h1 className="text-3xl font-bold tracking-tight">Conseil municipal</h1>
          <p className="text-muted-foreground">Gérez les membres du conseil et le maire.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <DataTable columns={columns} data={data} searchKey="name" isLoading={isLoading} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier' : 'Nouveau'} membre</DialogTitle>
            <DialogDescription>Renseignez les informations principales.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nom complet</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Rôle</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as CouncilMemberRole })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Titre du rôle</Label>
              <Input
                placeholder="1er Adjoint, Conseillère déléguée..."
                value={formData.roleTitle}
                onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Délégations</Label>
              <Textarea
                rows={3}
                value={formData.delegations}
                onChange={(e) => setFormData({ ...formData, delegations: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Téléphone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    setFormData({ ...formData, order: Number(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
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
              <Label>Photo</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setShowMediaPicker(true)}>
                  <Users className="mr-2 h-4 w-4" />
                  Choisir une photo
                </Button>
                {photoMedia && (
                  <span className="text-xs text-muted-foreground">{photoMedia.filename}</span>
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
          setPhotoMedia(media);
          setFormData((prev) => ({ ...prev, photoMediaId: media.id }));
        }}
        accept={['image/*']}
      />
    </div>
  );
}
