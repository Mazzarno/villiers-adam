import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import api from '@/lib/api';
import { EventDetailView } from '@/components/content/event-detail-view';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await api.events.get(slug).catch(() => null);
  if (!event) {
    return { title: 'Événement introuvable' };
  }

  return {
    title: event.title,
    description: event.description || 'Événement à Villiers-Adam',
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await api.events.get(slug).catch(() => null);

  if (!event) {
    notFound();
  }

  return (
    <EventDetailView
      event={{
        title: event.title,
        description: event.description,
        content: event.content,
        featuredImage: event.featuredImage,
        location: event.location,
        address: event.address,
        startDate: event.startDate,
        endDate: event.endDate,
      }}
    />
  );
}
