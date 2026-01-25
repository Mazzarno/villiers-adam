import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTime, cn } from '@/lib/utils';
import { Event } from '@/lib/api';
import api from '@/lib/api';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Agenda',
  description: 'Découvrez les événements et manifestations à Villiers-Adam.',
};

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

async function getAgendaEvents() {
  try {
    const events = await api.events.list();
    return events;
  } catch (error) {
    console.error('Failed to load events:', error);
    return [];
  }
}

export default async function AgendaPage() {
  const events = await getAgendaEvents();
  const groupedEvents = groupEventsByMonth(events);

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
                      <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 my-4">
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
