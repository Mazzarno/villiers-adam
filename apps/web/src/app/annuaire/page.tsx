import type { Metadata } from 'next';
import { ExternalLink, MapPin } from 'lucide-react';
import api, { type DirectoryEntry } from '@/lib/api';
import { AnnuaireClient } from './annuaire-client';

export const metadata: Metadata = {
  title: 'Annuaire',
  description: 'Retrouvez les associations, commerces et services de Villiers-Adam.',
};

const liensUtiles = [
  { label: 'Service-Public.fr', href: 'https://www.service-public.fr', description: 'Demarches administratives' },
  { label: 'Prefecture du Val-d\'Oise', href: 'https://www.val-doise.gouv.fr', description: 'Services de l\'Etat' },
  { label: 'CAF', href: 'https://www.caf.fr', description: 'Caisse d\'allocations familiales' },
  { label: 'CPAM', href: 'https://www.ameli.fr', description: 'Assurance maladie' },
  { label: 'PNR du Vexin francais', href: 'https://www.pnr-vexin-francais.fr', description: 'Parc naturel regional' },
  { label: 'Ile-de-France Mobilites', href: 'https://www.iledefrance-mobilites.fr', description: 'Transports en commun' },
];

const communesVoisines = [
  { nom: 'Bethemont-la-Foret', distance: '3 km' },
  { nom: 'Meriel', distance: '3 km' },
  { nom: 'Frepillon', distance: '4 km' },
  { nom: 'Chauvry', distance: '3 km' },
  { nom: "L'Isle-Adam", distance: '5 km' },
];

export default async function AnnuairePage() {
  let entries: DirectoryEntry[] = [];

  try {
    entries = await api.directory.list();
  } catch (error) {
    console.error('Failed to load directory:', error);
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />
        <div className="container relative">
          <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
            <span className="w-8 h-px bg-villiers-gold" />
            Vie locale
          </span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-4">
            Annuaire
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Retrouvez les associations, commerces et services de Villiers-Adam.
          </p>
        </div>
      </section>

      <AnnuaireClient initialEntries={entries} />

      {/* Liens utiles statiques */}
      <section className="border-t border-border/50 bg-background">
        <div className="container py-12">
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
            Liens utiles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liensUtiles.map((lien) => (
              <a
                key={lien.label}
                href={lien.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 rounded-organic border border-border/50 bg-background hover:border-villiers-gold/30 hover:shadow-organic-hover transition-all duration-300 group"
              >
                <ExternalLink className="h-4 w-4 text-villiers-gold shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {lien.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{lien.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Communes voisines */}
      <section className="border-t border-border/50 bg-muted/20">
        <div className="container py-12">
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-villiers-gold" />
            Communes voisines
          </h2>
          <div className="flex flex-wrap gap-3">
            {communesVoisines.map((commune) => (
              <div
                key={commune.nom}
                className="px-4 py-2 rounded-organic bg-background border border-border/50 text-sm"
              >
                <span className="font-medium text-foreground">{commune.nom}</span>
                <span className="text-muted-foreground ml-2">({commune.distance})</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
