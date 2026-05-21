'use client';

import * as React from 'react';
import Link from 'next/link';
import { Globe, Loader2, Mail, Pencil, Phone, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { annuaire, type DirectoryEntry } from '@/lib/api';

export default function AssociationsPage() {
  const [associations, setAssociations] = React.useState<DirectoryEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await annuaire.list({ type: 'ASSOCIATION' });
        setAssociations(data);
      } catch (error) {
        console.error('Failed to load associations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const published = associations.filter((a) => a.status === 'PUBLISHED').length;
  const drafts = associations.filter((a) => a.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Associations</h1>
          <p className="text-muted-foreground">
            Gérez les associations de la commune
          </p>
        </div>
        <Button className="w-full sm:w-auto" asChild>
          <Link href="/annuaire">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle association
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{associations.length}</div>
            <p className="text-xs text-muted-foreground">associations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiées</CardTitle>
            <Badge variant="default" className="text-xs">{published}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{published}</div>
            <p className="text-xs text-muted-foreground">visibles sur le site</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <Badge variant="secondary" className="text-xs">{drafts}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drafts}</div>
            <p className="text-xs text-muted-foreground">en attente de publication</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            Associations
          </CardTitle>
          <CardDescription>
            Entrées de l&apos;annuaire de type ASSOCIATION
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : associations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                Aucune association dans l&apos;annuaire
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez des associations via l&apos;annuaire avec le type ASSOCIATION
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/annuaire">
                  Voir l&apos;annuaire
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {associations.map((assoc) => (
                <div key={assoc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{assoc.name}</p>
                    {assoc.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{assoc.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {assoc.phone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> {assoc.phone}
                        </span>
                      )}
                      {assoc.email && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" /> {assoc.email}
                        </span>
                      )}
                      {assoc.website && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" /> Site web
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={assoc.status === 'PUBLISHED' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {assoc.status === 'PUBLISHED' ? 'Publié' : assoc.status === 'DRAFT' ? 'Brouillon' : assoc.status}
                    </Badge>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href="/annuaire">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
