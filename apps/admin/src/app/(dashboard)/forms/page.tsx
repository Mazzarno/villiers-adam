'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Eye, CheckCircle, Clock, AlertTriangle, MessageSquare, User, Mail, Phone } from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/content/data-table';
import { Badge } from '@/components/ui/badge';
import { forms, type FormSubmission } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const statusOptions = [
  { label: 'Tous', value: '' },
  { label: 'Nouveau', value: 'NEW' },
  { label: 'En cours', value: 'IN_PROGRESS' },
  { label: 'Résolu', value: 'RESOLVED' },
  { label: 'Fermé', value: 'CLOSED' },
];

const typeOptions = [
  { label: 'Tous', value: '' },
  { label: 'Contact', value: 'CONTACT' },
  { label: 'Signalement', value: 'SIGNALEMENT' },
  { label: 'Autre', value: 'AUTRE' },
];

const statusLabels: Record<string, string> = {
  NEW: 'Nouveau',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolu',
  CLOSED: 'Fermé',
};

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'info'> = {
  NEW: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'secondary',
};

const typeLabels: Record<string, string> = {
  CONTACT: 'Contact',
  SIGNALEMENT: 'Signalement',
  AUTRE: 'Autre',
};

const typeIcons: Record<string, typeof MessageSquare> = {
  CONTACT: MessageSquare,
  SIGNALEMENT: AlertTriangle,
  AUTRE: MessageSquare,
};

export default function FormsPage() {
  const [data, setData] = React.useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedSubmission, setSelectedSubmission] = React.useState<FormSubmission | null>(null);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await forms.list();
      setData(result);
    } catch (error) {
      console.error('Failed to load forms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await forms.updateStatus(id, status);
      loadData();
      if (selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: status as FormSubmission['status'] });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const columns: ColumnDef<FormSubmission>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const Icon = typeIcons[row.original.type] || MessageSquare;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span>{typeLabels[row.original.type] || row.original.type}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'subject',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Sujet
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.subject || 'Sans sujet'}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {row.original.message}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Expéditeur',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name || 'Anonyme'}</p>
          {row.original.email && (
            <p className="text-sm text-muted-foreground">{row.original.email}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge variant={statusColors[row.original.status] || 'default'}>
          {statusLabels[row.original.status] || row.original.status}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        return value === '' || row.getValue(id) === value;
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Reçu
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
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
              <DropdownMenuItem onClick={() => setSelectedSubmission(item)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {item.status === 'NEW' && (
                <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'IN_PROGRESS')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Marquer en cours
                </DropdownMenuItem>
              )}
              {item.status === 'IN_PROGRESS' && (
                <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marquer résolu
                </DropdownMenuItem>
              )}
              {(item.status === 'NEW' || item.status === 'IN_PROGRESS' || item.status === 'RESOLVED') && (
                <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'CLOSED')}>
                  Fermer
                </DropdownMenuItem>
              )}
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
          <h1 className="text-3xl font-bold tracking-tight">Formulaires</h1>
          <p className="text-muted-foreground">
            Gérez les messages de contact et signalements
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchKey="subject"
          searchPlaceholder="Rechercher par sujet..."
          filterColumn="status"
          filterOptions={statusOptions}
        />
      )}

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedSubmission?.subject || 'Message sans sujet'}
            </DialogTitle>
            <DialogDescription>
              {typeLabels[selectedSubmission?.type || ''] || 'Message'} reçu le {selectedSubmission && formatDate(selectedSubmission.createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Statut</span>
                <Select
                  value={selectedSubmission.status}
                  onValueChange={(value) => handleUpdateStatus(selectedSubmission.id, value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">Nouveau</SelectItem>
                    <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                    <SelectItem value="RESOLVED">Résolu</SelectItem>
                    <SelectItem value="CLOSED">Fermé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="font-medium">Expéditeur</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedSubmission.name || 'Anonyme'}</span>
                  </div>
                  {selectedSubmission.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedSubmission.email}`} className="text-primary hover:underline">
                        {selectedSubmission.email}
                      </a>
                    </div>
                  )}
                  {selectedSubmission.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${selectedSubmission.phone}`} className="text-primary hover:underline">
                        {selectedSubmission.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 rounded-lg border p-4">
                <h4 className="font-medium">Message</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>

              {selectedSubmission.email && (
                <div className="flex justify-end pt-4 border-t">
                  <Button asChild>
                    <a href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject || 'Votre message'}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Répondre par email
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
