'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookOpen, Loader2, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { municipalServices, type MunicipalService } from '@/lib/api';

export default function BibliothequePage() {
  const [services, setServices] = React.useState<MunicipalService[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await municipalServices.list();
        const filtered = data.filter(
          (s) => s.category?.toUpperCase() === 'BIBLIOTHEQUE' || s.category?.toUpperCase() === 'MEDIATHEQUE'
        );
        setServices(filtered);
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bibliothèque</h1>
          <p className="text-muted-foreground">
            Gérez les informations de la bibliothèque municipale
          </p>
        </div>
        <Button className="w-full sm:w-auto" asChild>
          <Link href="/mairie/services">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une bibliothèque
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bibliothèques</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{services.length}</div>
          <p className="text-xs text-muted-foreground">services configurés</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-600" />
            Bibliothèques et médiathèques
          </CardTitle>
          <CardDescription>
            Services municipaux de catégorie BIBLIOTHEQUE, MEDIATHEQUE
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Aucune bibliothèque configurée</p>
              <p className="text-sm text-muted-foreground mt-1">
                Créez un service municipal avec la catégorie BIBLIOTHEQUE pour le voir ici
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/mairie/services">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une bibliothèque
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    {service.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>
                    )}
                    <div className="flex gap-3 mt-1">
                      {service.phone && <p className="text-xs text-muted-foreground">{service.phone}</p>}
                      {service.email && <p className="text-xs text-muted-foreground">{service.email}</p>}
                      {service.address && <p className="text-xs text-muted-foreground">{service.address}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={service.status === 'PUBLISHED' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {service.status === 'PUBLISHED' ? 'Publié' : service.status === 'DRAFT' ? 'Brouillon' : service.status}
                    </Badge>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href="/mairie/services">
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
