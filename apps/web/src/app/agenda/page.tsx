import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime, cn } from '@/lib/utils';
import { Event } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Agenda',
  description: 'Découvrez les événements et manifestations à Villiers-Adam.',
};

// Données de démonstration
const demoEvents: Event[] = [
  {
    id: '1',
    title: 'Voeux du Maire à la population',
    slug: 'voeux-maire-2025',
    description: 'La municipalité vous convie à la cérémonie des voeux du Maire pour cette nouvelle année.',
    startDate: '2025-01-26T18:00:00Z',
    allDay: false,
    location: 'Salle des fêtes',
    address: '1 Place de la Mairie, 95840 Villiers-Adam',
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
    startDate: '2025-02-08T14:00:00Z',
    endDate: '2025-02-08T16:30:00Z',
    allDay: false,
    location: 'Bibliothèque municipale',
    category: 'Jeunesse',
    status: 'published',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Marché de producteurs',
    slug: 'marche-producteurs-fevrier',
    description: 'Rendez-vous mensuel avec les producteurs locaux du Vexin français.',
    startDate: '2025-02-15T09:00:00Z',
    endDate: '2025-02-15T13:00:00Z',
    allDay: false,
    location: 'Place de la Mairie',
    category: 'Marché',
    status: 'published',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '4',
    title: 'Conseil municipal',
    slug: 'conseil-municipal-fevrier',
    description: 'Séance publique du conseil municipal. Ordre du jour disponible en mairie.',
    startDate: '2025-02-20T20:00:00Z',
    allDay: false,
    location: 'Salle du conseil',
    category: 'Institutionnel',
    status: 'published',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '5',
    title: 'Carnaval des enfants',
    slug: 'carnaval-enfants-2025',
    description: 'Défilé costumé dans les rues du village suivi d\'un goûter.',
    startDate: '2025-03-01T14:30:00Z',
    allDay: false,
    location: 'Départ place de l\'Église',
    category: 'Fête',
    status: 'published',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '6',
    title: 'Bourse aux vêtements',
    slug: 'bourse-vetements-printemps',
    description: 'Bourse aux vêtements enfants et adultes organisée par l\'association des parents d\'élèves.',
    startDate: '2025-03-15T09:00:00Z',
    endDate: '2025-03-15T17:00:00Z',
    allDay: false,
    location: 'Salle des fêtes',
    category: 'Brocante',
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

function groupEventsByMonth(events: Event[]) {
  const grouped: Record<string, Event[]> = {};

  events.forEach((event) => {
    const date = new Date(event.startDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(event);
  });

  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
}

function getMonthName(key: string) {
  const [year, month] = key.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export default function AgendaPage() {
  const groupedEvents = groupEventsByMonth(demoEvents);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Agenda
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            Retrouvez tous les événements et manifestations à venir à Villiers-Adam.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b bg-background sticky top-[7.5rem] z-40">
        <div className="container py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Filtrer :</span>
            <Button variant="outline" size="sm" className="rounded-full">
              Tous
            </Button>
            {Object.keys(categoryColors).map((category) => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Events list */}
      <section className="container py-12">
        <div className="space-y-12">
          {groupedEvents.map(([monthKey, events]) => (
            <div key={monthKey}>
              <h2 className="font-heading text-2xl font-semibold mb-6 capitalize sticky top-[11rem] bg-muted/30 py-2 backdrop-blur-sm z-30">
                {getMonthName(monthKey)}
              </h2>

              <div className="space-y-4">
                {events.map((event) => {
                  const startDate = new Date(event.startDate);
                  const day = startDate.getDate();
                  const weekday = startDate.toLocaleDateString('fr-FR', { weekday: 'short' });

                  return (
                    <Link key={event.id} href={`/agenda/${event.slug}`}>
                      <Card className="group hover:shadow-lg transition-all hover:-translate-y-1">
                        <CardContent className="p-0">
                          <div className="flex">
                            {/* Date badge */}
                            <div className="flex-shrink-0 w-20 md:w-24 bg-primary/5 flex flex-col items-center justify-center p-4 border-r">
                              <span className="text-xs uppercase text-muted-foreground">
                                {weekday}
                              </span>
                              <span className="text-3xl md:text-4xl font-bold text-primary">
                                {day}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4 md:p-6">
                              <div className="flex flex-wrap items-start gap-2 mb-2">
                                {event.category && (
                                  <Badge
                                    className={cn(
                                      'font-normal',
                                      categoryColors[event.category] || 'bg-muted'
                                    )}
                                  >
                                    {event.category}
                                  </Badge>
                                )}
                              </div>

                              <h3 className="font-heading text-lg md:text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                {event.title}
                              </h3>

                              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                {event.description}
                              </p>

                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {!event.allDay && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatTime(event.startDate)}
                                    {event.endDate && ` - ${formatTime(event.endDate)}`}
                                  </span>
                                )}
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {groupedEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun événement à venir</h2>
            <p className="text-muted-foreground">
              Revenez bientôt pour découvrir les prochaines manifestations.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
