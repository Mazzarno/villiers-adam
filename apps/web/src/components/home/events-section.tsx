'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatDateShort, formatTime } from '@/lib/utils';
import type { Event } from '@/lib/api';

interface EventsSectionProps {
  events: Event[];
}

export function EventsSection({ events }: EventsSectionProps) {
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-2">
              Agenda
            </h2>
            <p className="text-muted-foreground">
              Prochains événements dans la commune
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/agenda">
              Tout l&apos;agenda
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Events list */}
        <div className="grid gap-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/agenda/${event.slug}`}>
                <Card className="overflow-hidden hover:border-primary/50 transition-colors group">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Date block */}
                      <div className="sm:w-32 bg-primary text-primary-foreground p-4 flex sm:flex-col items-center justify-center text-center shrink-0">
                        <div className="text-3xl font-bold">
                          {new Date(event.startDate).getDate()}
                        </div>
                        <div className="text-sm uppercase ml-2 sm:ml-0">
                          {new Date(event.startDate).toLocaleDateString('fr-FR', {
                            month: 'short',
                          })}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 sm:p-6">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {event.category && (
                            <Badge variant="outline">{event.category}</Badge>
                          )}
                          {event.status === 'cancelled' && (
                            <Badge variant="destructive">Annulé</Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-heading font-semibold mb-2 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.allDay ? (
                              <span>Toute la journée</span>
                            ) : (
                              <span>{formatTime(event.startDate)}</span>
                            )}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="hidden sm:flex items-center px-6">
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {events.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun événement à venir</p>
          </Card>
        )}
      </div>
    </section>
  );
}
