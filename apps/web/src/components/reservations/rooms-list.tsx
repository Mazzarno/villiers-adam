'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import api, { type Room } from '@/lib/api';

export function RoomsList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadRooms = async () => {
      try {
        const data = await api.rooms.list();
        if (active) {
          setRooms(data);
        }
      } catch {
        if (active) {
          setError('Impossible de charger les salles pour le moment.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRooms();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Chargement des salles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
        Aucune salle disponible pour le moment.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <Card key={room.id} className="group overflow-hidden hover:shadow-lg transition-all">
          <div className="aspect-video bg-muted relative overflow-hidden">
            <ImagePlaceholder
              label="Visuel à venir"
              className="h-full w-full rounded-none border-0 bg-muted/60"
            />
          </div>

          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {room.name}
              </CardTitle>
              {room.capacity && (
                <Badge variant="secondary" className="shrink-0">
                  <Users className="h-3 w-3 mr-1" />
                  {room.capacity}
                </Badge>
              )}
            </div>
            {room.description && (
              <CardDescription>{room.description}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {room.location && (
              <div className="text-sm text-muted-foreground">
                Localisation : {room.location}
              </div>
            )}

            <Button asChild className="w-full">
              <Link href={`/reservations/${room.slug}`}>
                Voir les disponibilités
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
