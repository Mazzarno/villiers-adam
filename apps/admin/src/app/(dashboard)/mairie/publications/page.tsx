'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PublicationsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Publications administratives</h1>
          <p className="text-muted-foreground">
            Arrêtés municipaux, comptes rendus, délibérations
          </p>
        </div>
        <Button
          onClick={() => router.push('/content/articles?type=PUBLICATION')}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle publication
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="arrete">Arrêtés</TabsTrigger>
          <TabsTrigger value="compte-rendu">Comptes rendus</TabsTrigger>
          <TabsTrigger value="deliberation">Délibérations</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les publications</CardTitle>
              <CardDescription>
                Liste de toutes les publications administratives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Gérez vos publications dans la section Actualités
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/content/articles?type=PUBLICATION')}
                >
                  Voir les actualités
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arrete" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Arrêtés municipaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Aucun arrêté</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compte-rendu" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Comptes rendus du conseil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Aucun compte rendu</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliberation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Délibérations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Aucune délibération</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
