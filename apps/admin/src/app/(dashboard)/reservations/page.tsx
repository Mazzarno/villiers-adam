'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Eye, CheckCircle, XCircle, Clock, Calendar, User, Mail, Phone } from 'lucide-react';
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
import { DataTable } from '@/components/content/data-table';
import { Badge } from '@/components/ui/badge';
import { reservations, type Reservation } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const statusOptions = [
  { label: 'Tous', value: '' },
  { label: 'En attente', value: 'PENDING' },
  { label: 'Approuvée', value: 'APPROVED' },
  { label: 'Refusée', value: 'REJECTED' },
  { label: 'Annulée', value: 'CANCELLED' },
];

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvée',
  REJECTED: 'Refusée',
  CANCELLED: 'Annulée',
};

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'destructive' | 'warning'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  CANCELLED: 'secondary',
};

export default function ReservationsPage() {
  const [data, setData] = React.useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedReservation, setSelectedReservation] = React.useState<Reservation | null>(null);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await reservations.list();
      setData(result);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await reservations.updateStatus(id, status);
      loadData();
      setSelectedReservation(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: 'room',
      meta: { label: 'Salle' },
      header: 'Salle',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.room?.name || 'Salle inconnue'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'requesterName',
      meta: { mobile: 'primary', label: 'Demandeur' },
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Demandeur
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.requesterName}</p>
          <p className="text-sm text-muted-foreground">{row.original.requesterEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: 'startsAt',
      meta: { label: 'Date' },
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          <p>{formatDate(row.original.startsAt)}</p>
          <p className="text-muted-foreground">
            jusqu&apos;à {formatDate(row.original.endsAt)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      meta: { label: 'Statut' },
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
      meta: { mobile: 'hidden', label: 'Demande' },
      header: 'Demande',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
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
              <DropdownMenuItem onClick={() => setSelectedReservation(item)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              {item.status === 'PENDING' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'APPROVED')}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Approuver
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'REJECTED')}>
                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                    Refuser
                  </DropdownMenuItem>
                </>
              )}
              {item.status === 'APPROVED' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'CANCELLED')}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Annuler
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Réservations</h1>
          <p className="text-muted-foreground">
            Gérez les demandes de réservation de salles
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
          searchKey="requesterName"
          searchPlaceholder="Rechercher par demandeur..."
          filterColumn="status"
          filterOptions={statusOptions}
        />
      )}

      <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
            <DialogDescription>
              Réservation pour {selectedReservation?.room?.name || 'Salle inconnue'}
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-muted-foreground">Statut</span>
                <Badge variant={statusColors[selectedReservation.status]}>
                  {statusLabels[selectedReservation.status]}
                </Badge>
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="font-medium">Demandeur</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedReservation.requesterName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedReservation.requesterEmail}`} className="text-primary hover:underline">
                      {selectedReservation.requesterEmail}
                    </a>
                  </div>
                  {selectedReservation.requesterPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${selectedReservation.requesterPhone}`} className="text-primary hover:underline">
                        {selectedReservation.requesterPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="font-medium">Créneau demandé</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Du {formatDate(selectedReservation.startsAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Au {formatDate(selectedReservation.endsAt)}</span>
                  </div>
                </div>
              </div>

              {selectedReservation.notes && (
                <div className="space-y-2 rounded-lg border p-4">
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedReservation.notes}</p>
                </div>
              )}

              {selectedReservation.status === 'PENDING' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedReservation.id, 'REJECTED')}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Refuser
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedReservation.id, 'APPROVED')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approuver
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
