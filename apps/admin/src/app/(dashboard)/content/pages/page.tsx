'use client';

import * as React from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, ArrowUpDown, Eye, Pencil, Trash2, Archive, Send } from 'lucide-react';
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
import { pages, type Page } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const statusOptions = [
  { label: 'Brouillon', value: 'DRAFT' },
  { label: 'Programmé', value: 'SCHEDULED' },
  { label: 'Publié', value: 'PUBLISHED' },
  { label: 'Archivé', value: 'ARCHIVED' },
];

export default function PagesListPage() {
  const [data, setData] = React.useState<Page[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadPages = React.useCallback(async () => {
    try {
      const result = await pages.list();
      setData(result);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPages();
  }, [loadPages]);

  const handlePublish = React.useCallback(async (id: string) => {
    try {
      await pages.publish(id);
      loadPages();
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  }, [loadPages]);

  const handleArchive = React.useCallback(async (id: string) => {
    try {
      await pages.archive(id);
      loadPages();
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  }, [loadPages]);

  const handleDelete = React.useCallback(async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;
    try {
      await pages.delete(id);
      loadPages();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  }, [loadPages]);

  const columns = React.useMemo<ColumnDef<Page>[]>(
    () => [
      {
        accessorKey: 'title',
        meta: { mobile: 'primary', label: 'Titre' },
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Titre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.title}</p>
            <p className="text-sm text-muted-foreground">/{row.original.slug}</p>
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
        accessorKey: 'author',
        meta: { mobile: 'hidden', label: 'Auteur' },
        header: 'Auteur',
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.author
              ? `${row.original.author.firstName} ${row.original.author.lastName}`
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'updatedAt',
        meta: { mobile: 'hidden', label: 'Modifié' },
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Modifié
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
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
          const page = row.original;
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
                  <Link href={`/content/pages/${page.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(`/${page.slug}`, '_blank')}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Prévisualiser
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {page.status === 'DRAFT' && (
                  <DropdownMenuItem onClick={() => handlePublish(page.id)}>
                    <Send className="mr-2 h-4 w-4" />
                    Publier
                  </DropdownMenuItem>
                )}
                {page.status === 'PUBLISHED' && (
                  <DropdownMenuItem onClick={() => handleArchive(page.id)}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archiver
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(page.id)}
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
    ],
    [handleArchive, handleDelete, handlePublish, formatDate]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted-foreground">
            Gérez les pages statiques de votre site
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/content/pages/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle page
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
          searchPlaceholder="Rechercher une page..."
          filterColumn="status"
          filterOptions={statusOptions}
        />
      )}
    </div>
  );
}
