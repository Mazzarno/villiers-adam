'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BrevesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brèves administratives</h1>
          <p className="text-muted-foreground">
            Informations courtes et rapides pour les administrés
          </p>
        </div>
        <Button
          onClick={() => router.push('/content/articles?type=BREVE')}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle brève
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brèves</CardTitle>
          <CardDescription>
            Liste des brèves administratives publiées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              Gérez vos brèves dans la section Actualités
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/content/articles?type=BREVE')}
            >
              Voir les actualités
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
