import type { Metadata } from 'next';
import api, { type Event } from '@/lib/api';
import { EvenementsClient } from './evenements-client';

export const metadata: Metadata = {
  title: 'Evenements',
  description: 'Decouvrez les evenements de la commune de Villiers-Adam',
};

export default async function EvenementsPage() {
  let events: Event[] = [];

  try {
    events = await api.events.list();
  } catch (error) {
    console.error('Failed to load events:', error);
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
              <span className="w-8 h-px bg-villiers-gold" />
              Vie locale
            </span>
            <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">
              Evenements
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Retrouvez toutes les informations sur les evenements a venir dans la commune.
            </p>
          </div>
        </div>
      </section>

      <EvenementsClient events={sorted} />
    </div>
  );
}
