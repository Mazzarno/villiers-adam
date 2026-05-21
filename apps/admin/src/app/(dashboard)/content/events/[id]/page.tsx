'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ContentForm, type ContentFormData } from '@/components/content/content-form';
import { events, type Event } from '@/lib/api';
import { toast } from 'sonner';

export default function EditEvent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [eventData, setEventData] = React.useState<Event | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await events.get(id);
        setEventData(data);
      } catch (error) {
        toast.error('Impossible de charger l\'événement');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSubmit = async (data: ContentFormData) => {
    if (!data.startsAt) {
      toast.error('La date de début est obligatoire');
      return;
    }

    const status = data.status === 'SCHEDULED' ? 'DRAFT' : data.status;

    if (data.status === 'SCHEDULED') {
      toast.message('Programmez l’événement via le bouton Programmer.', {
        description: 'Le statut est conservé en brouillon.',
      });
    }

    await events.update(id, {
      title: data.title,
      slug: data.slug,
      summary: data.summary || undefined,
      content: data.content || '',
      metaTitle: data.metaTitle || undefined,
      metaDescription: data.metaDescription || undefined,
      status,
      publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : undefined,
      coverMediaId: data.coverMediaId || undefined,
      locationName: data.locationName || undefined,
      startsAt: new Date(data.startsAt).toISOString(),
      endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : undefined,
    });

    toast.success('Événement mis à jour');
    router.refresh();
  };

  const handlePublish = async () => {
    await events.publish(id);
    toast.success('Événement publié');
    router.refresh();
  };

  const handleSchedule = async (scheduledAt: string) => {
    await events.schedule(id, new Date(scheduledAt).toISOString());
    toast.success('Événement programmé');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Événement introuvable</h1>
        <button
          className="text-primary underline"
          onClick={() => router.push('/content/events')}
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modifier l’événement</h1>
        <p className="text-muted-foreground">Mettre à jour le contenu et la publication.</p>
      </div>
      <ContentForm
        type="event"
        initialData={eventData}
        onSubmit={handleSubmit}
        onPublish={handlePublish}
        onSchedule={handleSchedule}
      />
    </div>
  );
}
