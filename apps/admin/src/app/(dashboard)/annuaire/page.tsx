'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Plus,
  ArrowUpDown,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Send,
  Archive,
  Clock,
  ImageIcon,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { MediaPicker } from '@/components/media/media-picker';
import { StatusBadge } from '@/components/content/status-badge';
import { OpeningHoursEditor } from '@/components/forms/opening-hours-editor';
import { annuaire, type DirectoryEntry, type Media } from '@/lib/api';

const typeOptions = [
  { label: 'Association', value: 'ASSOCIATION' },
  { label: 'Entreprise', value: 'ENTERPRISE' },
  { label: 'Commerce', value: 'COMMERCE' },
];

const typeLabels: Record<string, string> = {
  ASSOCIATION: 'Association',
  ENTERPRISE: 'Entreprise',
  COMMERCE: 'Commerce',
};

const typeColors: Record<string, 'default' | 'secondary' | 'success'> = {
  ASSOCIATION: 'default',
  ENTERPRISE: 'secondary',
  COMMERCE: 'success',
};

type FormData = {
  name: string;
  type: string;
  description: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  latitude: string;
  longitude: string;
  openingHours: Record<string, string>;
  coverMediaId: string;
};

const defaultFormData: FormData = {
  name: '',
  type: 'ASSOCIATION',
  description: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  city: '',
  country: '',
  phone: '',
  email: '',
  website: '',
  latitude: '',
  longitude: '',
  openingHours: {},
  coverMediaId: '',
};

export default function AnnuairePage() {
  const searchParams = useSearchParams();
  const [data, setData] = React.useState<DirectoryEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<FormData>(defaultFormData);
  const [isSaving, setIsSaving] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  const [scheduleDialogOpen, setScheduleDialogOpen] = React.useState(false);
  const [scheduleValue, setScheduleValue] = React.useState('');
  const [schedulingId, setSchedulingId] = React.useState<string | null>(null);
  const [isScheduling, setIsScheduling] = React.useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = React.useState(false);
  const [selectedMedia, setSelectedMedia] = React.useState<Media | null>(null);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await annuaire.list();
      setData(result);
    } catch (error) {
      console.error('Failed to load annuaire:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setSelectedMedia(null);
    setFormError('');
    setDialogOpen(true);
  };

  const handleEdit = (item: DirectoryEntry) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      type: item.type,
      description: item.description || '',
      addressLine1: item.addressLine1 || '',
      addressLine2: item.addressLine2 || '',
      postalCode: item.postalCode || '',
      city: item.city || '',
      country: item.country || '',
      phone: item.phone || '',
      email: item.email || '',
      website: item.website || '',
      latitude: item.latitude?.toString() || '',
      longitude: item.longitude?.toString() || '',
      openingHours: item.openingHours ?? {},
      coverMediaId: item.coverMediaId || '',
    });
    setSelectedMedia(item.coverMediaId ? { id: item.coverMediaId } as Media : null);
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFormError('');
    try {
      if (!formData.name.trim()) {
        setFormError('Le nom est obligatoire.');
        setIsSaving(false);
        return;
      }

      const latitudeValue = formData.latitude ? Number(formData.latitude) : undefined;
      const longitudeValue = formData.longitude ? Number(formData.longitude) : undefined;
      const openingHours =
        formData.openingHours && Object.keys(formData.openingHours).length > 0
          ? formData.openingHours
          : undefined;

      const payload = {
        name: formData.name,
        type: formData.type as 'ASSOCIATION' | 'ENTERPRISE' | 'COMMERCE',
        description: formData.description || undefined,
        addressLine1: formData.addressLine1 || undefined,
        addressLine2: formData.addressLine2 || undefined,
        postalCode: formData.postalCode || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        latitude: Number.isFinite(latitudeValue) ? latitudeValue : undefined,
        longitude: Number.isFinite(longitudeValue) ? longitudeValue : undefined,
        openingHours,
        coverMediaId: formData.coverMediaId || undefined,
      };

      if (editingId) {
        await annuaire.update(editingId, payload);
      } else {
        await annuaire.create(payload);
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        (error as Error).message ||
        'Impossible d\'enregistrer l\'entrée.';
      setFormError(message);
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) return;
    try {
      await annuaire.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await annuaire.publish(id);
      loadData();
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await annuaire.archive(id);
      loadData();
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  const toDateTimeLocal = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (val: number) => String(val).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}`;
  };

  const openScheduleDialog = (item: DirectoryEntry) => {
    setSchedulingId(item.id);
    setScheduleValue(toDateTimeLocal(item.scheduledAt ?? item.createdAt));
    setScheduleDialogOpen(true);
  };

  const handleSchedule = async () => {
    if (!schedulingId || !scheduleValue) return;
    setIsScheduling(true);
    try {
      await annuaire.schedule(schedulingId, new Date(scheduleValue).toISOString());
      setScheduleDialogOpen(false);
      setSchedulingId(null);
      setScheduleValue('');
      loadData();
    } catch (error) {
      console.error('Failed to schedule:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const formatAddress = (item: DirectoryEntry) => {
    const cityLine = [item.postalCode, item.city].filter(Boolean).join(' ');
    return [
      item.addressLine1,
      item.addressLine2,
      cityLine,
      item.country,
    ]
      .filter(Boolean)
      .join(', ');
  };

  const columns: ColumnDef<DirectoryEntry>[] = [
    {
      accessorKey: 'name',
      meta: { mobile: 'primary', label: 'Nom' },
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
          {row.original.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      meta: { label: 'Type' },
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant={typeColors[row.original.type] || 'default'}>
          {typeLabels[row.original.type] || row.original.type}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        return value === '' || row.getValue(id) === value;
      },
    },
    {
      accessorKey: 'status',
      meta: { label: 'Statut' },
      header: 'Statut',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'addressLine1',
      meta: { mobile: 'hidden', label: 'Contact' },
      header: 'Contact',
      cell: ({ row }) => (
        <div className="text-sm space-y-1">
          {formatAddress(row.original) && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[200px]">{formatAddress(row.original)}</span>
            </div>
          )}
          {row.original.phone && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{row.original.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      meta: { mobile: 'hidden', label: 'En ligne' },
      header: 'En ligne',
      cell: ({ row }) => (
        <div className="text-sm space-y-1">
          {row.original.email && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{row.original.email}</span>
            </div>
          )}
          {row.original.website && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Globe className="h-3 w-3" />
              <a
                href={row.original.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline truncate max-w-[150px]"
              >
                Site web
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      meta: { mobile: 'actions', label: 'Actions' },
      cell: ({ row }) => {
        const item = row.original;
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
              <DropdownMenuItem onClick={() => handleEdit(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              {item.status !== 'ARCHIVED' && (
                <DropdownMenuItem onClick={() => openScheduleDialog(item)}>
                  <Clock className="mr-2 h-4 w-4" />
                  Programmer
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {(item.status === 'DRAFT' || item.status === 'SCHEDULED') && (
                <DropdownMenuItem onClick={() => handlePublish(item.id)}>
                  <Send className="mr-2 h-4 w-4" />
                  Publier
                </DropdownMenuItem>
              )}
              {item.status === 'PUBLISHED' && (
                <DropdownMenuItem onClick={() => handleArchive(item.id)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archiver
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(item.id)}
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

  const typeParam = searchParams.get('type');
  const searchParam = searchParams.get('search');
  const typeFilter = React.useMemo(() => {
    if (!typeParam) return null;
    if (typeParam === 'ECONOMY') return ['COMMERCE', 'ENTERPRISE'];
    return [typeParam];
  }, [typeParam]);

  const filteredData = React.useMemo(() => {
    let filtered = data;
    if (typeFilter) {
      filtered = filtered.filter((entry) => entry.type && typeFilter.includes(entry.type));
    }
    const term = (searchParam || '').trim().toLowerCase();
    if (term) {
      filtered = filtered.filter((entry) =>
        [entry.name, entry.description, entry.city, entry.addressLine1, entry.addressLine2]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term)),
      );
    }
    return filtered;
  }, [data, typeFilter, searchParam]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Annuaire</h1>
          <p className="text-muted-foreground">
            Gérez l&apos;annuaire des associations, entreprises et commerces
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle entrée
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          searchKey="name"
          searchPlaceholder="Rechercher dans l'annuaire..."
          filterColumn="type"
          filterOptions={typeOptions}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Modifier l\'entrée' : 'Nouvelle entrée'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de l&apos;entrée
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSOCIATION">Association</SelectItem>
                    <SelectItem value="ENTERPRISE">Entreprise</SelectItem>
                    <SelectItem value="COMMERCE">Commerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de l'activité"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Adresse (ligne 1)</Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                placeholder="Numéro et rue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Adresse (ligne 2)</Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                placeholder="Bâtiment, appartement, étage..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="95840"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Villiers-Adam"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="France"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01 23 45 67 89"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@exemple.fr"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.exemple.fr"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="49.0833"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="2.3833"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Horaires d&apos;ouverture</Label>
              <OpeningHoursEditor
                value={formData.openingHours}
                onChange={(value) => setFormData((prev) => ({ ...prev, openingHours: value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Visuel</Label>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={() => setMediaPickerOpen(true)}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Choisir un média
                </Button>
                {formData.coverMediaId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, coverMediaId: '' }));
                      setSelectedMedia(null);
                    }}
                  >
                    Retirer
                  </Button>
                )}
              </div>
              {formData.coverMediaId && (
                <p className="text-xs text-muted-foreground">
                  Média sélectionné : {selectedMedia?.filename || formData.coverMediaId}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(media) => {
          setSelectedMedia(media);
          setFormData((prev) => ({ ...prev, coverMediaId: media.id }));
          setMediaPickerOpen(false);
        }}
        accept={['image/*']}
      />

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Programmer l&apos;entrée</DialogTitle>
            <DialogDescription>
              Choisissez la date et l&apos;heure de publication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleAt">Date de publication</Label>
              <Input
                id="scheduleAt"
                type="datetime-local"
                value={scheduleValue}
                onChange={(e) => setScheduleValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSchedule} disabled={isScheduling || !scheduleValue}>
              {isScheduling ? 'Programmation...' : 'Programmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
