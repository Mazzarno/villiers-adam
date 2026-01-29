'use client';

import * as React from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, ArrowUpDown, Eye, Pencil, Trash2, Archive, Send, Zap } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/content/data-table';
import { StatusBadge } from '@/components/content/status-badge';
import { Badge } from '@/components/ui/badge';
import { articles, type Article, type ArticleType, type PublicationType } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const statusOptions = [
  { label: 'Brouillon', value: 'DRAFT' },
  { label: 'Programmé', value: 'SCHEDULED' },
  { label: 'Publié', value: 'PUBLISHED' },
  { label: 'Archivé', value: 'ARCHIVED' },
];

const typeLabels: Record<ArticleType, string> = {
  ACTUALITE: 'Actualité',
  PUBLICATION: 'Publication',
  BREVE: 'Brève',
};

const publicationLabels: Record<PublicationType, string> = {
  ARRETE: 'Arrêté',
  COMPTE_RENDU: 'Compte-rendu',
  DELIBERATION: 'Délibération',
};

const typeColors: Record<ArticleType, 'default' | 'secondary' | 'info'> = {
  ACTUALITE: 'default',
  PUBLICATION: 'secondary',
  BREVE: 'info',
};

export default function ArticlesListPage() {
  const [data, setData] = React.useState<Article[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [publicationFilter, setPublicationFilter] = React.useState<string>('all');

  React.useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const result = await articles.list();
      setData(result);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = React.useMemo(() => {
    let filtered = data;
    if (typeFilter !== 'all') {
      filtered = filtered.filter((article) => article.type === typeFilter);
    }
    if (typeFilter === 'PUBLICATION' && publicationFilter !== 'all') {
      filtered = filtered.filter((article) => article.publicationType === publicationFilter);
    }
    return filtered;
  }, [data, typeFilter, publicationFilter]);

  const handlePublish = async (id: string) => {
    try {
      await articles.publish(id);
      loadArticles();
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await articles.archive(id);
      loadArticles();
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) return;
    try {
      await articles.delete(id);
      loadArticles();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const columns: ColumnDef<Article>[] = [
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
          <div className="flex items-center gap-2">
            <p className="font-medium">{row.original.title}</p>
            {row.original.isFlash && (
              <Badge variant="warning" className="gap-1">
                <Zap className="h-3 w-3" />
                Flash
              </Badge>
            )}
          </div>
          {row.original.summary && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {row.original.summary}
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
        <div className="space-y-1">
          <Badge variant={typeColors[row.original.type] || 'default'}>
            {typeLabels[row.original.type] || row.original.type}
          </Badge>
          {row.original.publicationType && (
            <p className="text-xs text-muted-foreground">
              {publicationLabels[row.original.publicationType]}
            </p>
          )}
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
      accessorKey: 'publishedAt',
      meta: { mobile: 'hidden', label: 'Publication' },
      header: 'Publication',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.publishedAt
            ? formatDate(row.original.publishedAt)
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      meta: { label: 'Modifié' },
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
        const article = row.original;
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
                <Link href={`/content/articles/${article.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`/actualites/${article.slug}`, '_blank')}
              >
                <Eye className="mr-2 h-4 w-4" />
                Prévisualiser
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {article.status === 'DRAFT' && (
                <DropdownMenuItem onClick={() => handlePublish(article.id)}>
                  <Send className="mr-2 h-4 w-4" />
                  Publier
                </DropdownMenuItem>
              )}
              {article.status === 'PUBLISHED' && (
                <DropdownMenuItem onClick={() => handleArchive(article.id)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archiver
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(article.id)}
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
          <h1 className="text-3xl font-bold tracking-tight">Actualités</h1>
          <p className="text-muted-foreground">
            Gérez les actualités, publications et brèves de votre mairie
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/content/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle actualité
          </Link>
        </Button>
      </div>

      {/* Type filter */}
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        <span className="text-sm text-muted-foreground">Type :</span>
        <Select
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value);
            if (value !== 'PUBLICATION') {
              setPublicationFilter('all');
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="ACTUALITE">Actualités</SelectItem>
            <SelectItem value="PUBLICATION">Publications</SelectItem>
            <SelectItem value="BREVE">Brèves</SelectItem>
          </SelectContent>
        </Select>
        {typeFilter === 'PUBLICATION' && (
          <Select value={publicationFilter} onValueChange={setPublicationFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Toutes les publications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="ARRETE">Arrêtés</SelectItem>
              <SelectItem value="COMPTE_RENDU">Comptes-rendus</SelectItem>
              <SelectItem value="DELIBERATION">Délibérations</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          searchKey="title"
          searchPlaceholder="Rechercher une actualité..."
          filterColumn="status"
          filterOptions={statusOptions}
        />
      )}
    </div>
  );
}
