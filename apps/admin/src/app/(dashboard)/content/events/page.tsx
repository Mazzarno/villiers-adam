'use client';

import * as React from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, ArrowUpDown, Eye, Pencil, Trash2, Send, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/content/data-table';
import { StatusBadge } from '@/components/content/status-badge';
import { events, type Event } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const statusOptions = [
  { label: 'Brouillon', value: 'DRAFT' },
  { label: 'Programmé', value: 'SCHEDULED' },
  { label: 'Publié', value: 'PUBLISHED' },
  { label: 'Archivé', value: 'ARCHIVED' },
];

export default function EventsListPage() {
  const [data, setData] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const result = await events.list();
      setData(result);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await events.publish(id);
      loadEvents();
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    try {
      await events.delete(id);
      loadEvents();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: 'title',
      meta: { mobile: 'primary', label: 'Événement' },
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Événement
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          {row.original.locationName && (
            <p className="text-sm text-muted-foreground">{row.original.locationName}</p>
          )}
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
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {formatDate(row.original.startsAt)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      meta: { label: 'Statut' },
      header: 'Statut',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return value === '' || row.getValue(id) === value;
      },
    },
    {
      accessorKey: 'updatedAt',
      meta: { mobile: 'hidden', label: 'Modifié' },
      header: 'Modifié',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.updatedAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      meta: { mobile: 'actions', label: 'Actions' },
      cell: ({ row }) => {
        const event = row.original;
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
              <DropdownMenuItem asChild>
                <Link href={`/content/events/${event.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`/agenda/${event.slug}`, '_blank')}
              >
                <Eye className="mr-2 h-4 w-4" />
                Prévisualiser
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {event.status === 'DRAFT' && (
                <DropdownMenuItem onClick={() => handlePublish(event.id)}>
                  <Send className="mr-2 h-4 w-4" />
                  Publier
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(event.id)}
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Événements</h1>
          <p className="text-muted-foreground">
            Gérez les événements et manifestations de votre commune
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/content/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel événement
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchKey="title"
          searchPlaceholder="Rechercher un événement..."
          filterColumn="status"
          filterOptions={statusOptions}
        />
      )}
    </div>
  );
}
