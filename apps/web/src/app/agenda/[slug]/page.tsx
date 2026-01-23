import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Clock, ArrowLeft, Share2, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime, cn } from '@/lib/utils';
import { Event } from '@/lib/api';

// Données de démonstration
const demoEvents: Event[] = [
  {
    id: '1',
    title: 'Voeux du Maire à la population',
    slug: 'voeux-maire-2025',
    description: 'La municipalité vous convie à la cérémonie des voeux du Maire pour cette nouvelle année.',
    content: `
      <p>Le Maire et le Conseil municipal ont le plaisir de vous convier à la traditionnelle cérémonie des vœux de la nouvelle année.</p>

      <p>Cette soirée sera l'occasion de dresser le bilan de l'année écoulée et de présenter les projets à venir pour notre commune.</p>

      <h3>Programme</h3>
      <ul>
        <li>18h00 : Accueil</li>
        <li>18h30 : Discours du Maire</li>
        <li>19h00 : Verre de l'amitié</li>
      </ul>

      <p>Venez nombreux partager ce moment de convivialité !</p>
    `,
    startDate: '2025-01-26T18:00:00Z',
    endDate: '2025-01-26T21:00:00Z',
    allDay: false,
    location: 'Salle des fêtes',
    address: '1 Place de la Mairie, 95840 Villiers-Adam',
    coordinates: { lat: 49.0833, lng: 2.3833 },
    category: 'Cérémonie',
    status: 'published',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Atelier créatif enfants',
    slug: 'atelier-creatif-fevrier',
    description: 'Atelier de création artistique pour les enfants de 6 à 12 ans. Inscription obligatoire.',
    content: `
      <p>La bibliothèque municipale organise un atelier créatif pour les enfants pendant les vacances de février.</p>

      <h3>Au programme</h3>
      <p>Les enfants pourront laisser libre cours à leur imagination avec différentes techniques artistiques : peinture, collage, modelage...</p>

      <h3>Informations pratiques</h3>
      <ul>
        <li>Âge : de 6 à 12 ans</li>
        <li>Places limitées à 15 enfants</li>
        <li>Matériel fourni</li>
        <li>Inscription obligatoire à la bibliothèque</li>
      </ul>
    `,
    startDate: '2025-02-08T14:00:00Z',
    endDate: '2025-02-08T16:30:00Z',
    allDay: false,
    location: 'Bibliothèque municipale',
    category: 'Jeunesse',
    status: 'published',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

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
  const event = demoEvents.find((e) => e.slug === slug);

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
  const event = demoEvents.find((e) => e.slug === slug);

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
            Retour à l'agenda
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
                <img
                  src={event.featuredImage}
                  alt={event.title}
                  className="w-full h-auto"
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

              <Button variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>

            {/* Map placeholder */}
            {event.coordinates && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Carte interactive</p>
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
