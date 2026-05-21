'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime } from '@/lib/utils';
import type { Event } from '@/lib/api';

interface EvenementsClientProps {
  events: Event[];
}

export function EvenementsClient({ events }: EvenementsClientProps) {
  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-villiers-gold/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-villiers-gold" />
            </div>
            <p className="text-muted-foreground font-heading">
              Aucun evenement n&apos;est actuellement programme.
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Revenez bientot pour decouvrir les prochaines activites.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link href={`/evenements/${event.slug}`} className="block h-full">
                  <Card className="overflow-hidden group hover:border-villiers-gold/30 hover:shadow-organic-hover transition-all duration-300 h-full">
                    {event.featuredImage && (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={event.featuredImage}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {event.title}
                      </CardTitle>
                      {event.description && (
                        <CardDescription className="line-clamp-2">
                          {event.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-villiers-gold" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-villiers-gold" />
                        <span>{formatTime(event.startDate)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 text-villiers-gold" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}

                      <span className="inline-flex items-center text-sm font-medium text-villiers-blue hover:text-villiers-gold transition-colors">
                        Voir le detail
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
