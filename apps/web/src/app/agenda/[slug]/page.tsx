import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, ArrowLeft, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShareButton } from '@/components/share-button';
import { MapEmbed } from '@/components/map/map-embed';
import { formatDate, formatTime, cn } from '@/lib/utils';
import api from '@/lib/api';

export const revalidate = 0;

const categoryColors: Record<string, string> = {
  'Cérémonie': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Jeunesse': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Marché': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Institutionnel': 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  'Fête': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'Brocante': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
};

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await api.events.get(slug).catch(() => null);

  if (!event) {
    return { title: 'Événement non trouvé' };
  }

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      type: 'article',
      images: event.featuredImage ? [event.featuredImage] : [],
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await api.events.get(slug).catch(() => null);

  if (!event) {
    notFound();
  }

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  // Generate ICS content for calendar
  const generateICS = () => {
    const start = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = endDate
      ? endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      : start;

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Villiers-Adam//NONSGML Event//FR
BEGIN:VEVENT
UID:${event.id}@villiers-adam.fr
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <Link
            href="/agenda"
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;agenda
          </Link>

          <div className="flex flex-wrap items-start gap-3 mb-4">
            {event.category && (
              <Badge
                className={cn(
                  'text-sm',
                  categoryColors[event.category] || 'bg-muted'
                )}
              >
                {event.category}
              </Badge>
            )}
          </div>

          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {event.title}
          </h1>

          <p className="text-lg text-primary-foreground/80 max-w-3xl">
            {event.description}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {event.featuredImage && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <Image
                  src={event.featuredImage}
                  alt={event.title}
                  width={1200}
                  height={675}
                  className="w-full h-auto"
                  sizes="100vw"
                />
              </div>
            )}

            {event.content && (
              <div
                className="prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: event.content }}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event details card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations pratiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{formatDate(event.startDate)}</p>
                    {event.allDay ? (
                      <p className="text-sm text-muted-foreground">Toute la journée</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {formatTime(event.startDate)}
                        {endDate && ` - ${formatTime(endDate)}`}
                      </p>
                    )}
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{event.location}</p>
                      {event.address && (
                        <p className="text-sm text-muted-foreground">{event.address}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button className="w-full" asChild>
                <a
                  href={`data:text/calendar;charset=utf-8,${encodeURIComponent(generateICS())}`}
                  download={`${event.slug}.ics`}
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Ajouter au calendrier
                </a>
              </Button>

              <ShareButton
                title={event.title}
                text={event.description}
                variant="outline"
                className="w-full"
              />
            </div>

            {/* Map */}
            {event.coordinates && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video">
                    <MapEmbed
                      lat={event.coordinates.lat}
                      lng={event.coordinates.lng}
                      label="Voir sur OpenStreetMap"
                      className="h-full w-full rounded-none border-0"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
