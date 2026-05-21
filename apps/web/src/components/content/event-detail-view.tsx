import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, MapPin, ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SafeHTML } from '@/components/ui/safe-html';
import { formatDate, formatTime } from '@/lib/utils';

export type EventDetailModel = {
  title: string;
  description?: string;
  content?: string;
  featuredImage?: string;
  location?: string;
  address?: string;
  startDate: string;
  endDate?: string;
};

interface EventDetailViewProps {
  event: EventDetailModel;
  backHref?: string;
  backLabel?: string;
  previewBanner?: React.ReactNode;
}

export function EventDetailView({
  event,
  backHref = '/evenements',
  backLabel = 'Retour aux événements',
  previewBanner,
}: EventDetailViewProps) {
  return (
    <div className="min-h-screen">
      {previewBanner}
      <section className="relative py-10">
        <div className="container">
          <Button asChild variant="ghost" className="mb-6">
            <Link href={backHref}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
            <div>
              <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground mb-4">
                {event.title}
              </h1>
              {event.description && (
                <p className="text-lg text-muted-foreground mb-6">
                  {event.description}
                </p>
              )}

              {event.featuredImage && (
                <div className="relative aspect-[16/9] rounded-organic overflow-hidden mb-8">
                  <Image
                    src={event.featuredImage}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {event.content && (
                <SafeHTML
                  html={event.content}
                  className="prose prose-villiers max-w-none"
                />
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-organic border border-border/50 p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-villiers-gold" />
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-villiers-gold" />
                  <span>{formatTime(event.startDate)}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-villiers-gold" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.address && (
                  <p className="text-sm text-muted-foreground">
                    {event.address}
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
