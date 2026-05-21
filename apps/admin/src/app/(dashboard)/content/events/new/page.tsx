'use client';

import { useRouter } from 'next/navigation';
import { ContentForm, type ContentFormData } from '@/components/content/content-form';
import { events } from '@/lib/api';
import { toast } from 'sonner';

export default function NewEvent() {
  const router = useRouter();

  const handleSubmit = async (data: ContentFormData) => {
    if (!data.startsAt) {
      toast.error('La date de début est obligatoire');
      return;
    }

    const status = data.status === 'SCHEDULED' ? 'DRAFT' : data.status;

    if (data.status === 'SCHEDULED') {
      toast.message('Programmez l’événement après création.', {
        description: 'Créez l’événement en brouillon puis utilisez le bouton Programmer.',
      });
    }

    await events.create({
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

    toast.success('Événement créé');
    router.push('/content/events');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouvel événement</h1>
        <p className="text-muted-foreground">Créez un événement pour l’agenda communal.</p>
      </div>
      <ContentForm type="event" onSubmit={handleSubmit} />
    </div>
  );
}
