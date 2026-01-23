import { Metadata } from 'next';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  Users,
  Store,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DirectoryEntry } from '@/lib/api';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Annuaire',
  description: 'Annuaire des associations, commerces et services de Villiers-Adam.',
};

// Données de démonstration
const demoEntries: DirectoryEntry[] = [
  {
    id: '1',
    name: 'Association des Parents d\'Élèves',
    category: 'Association',
    description: 'Association des parents d\'élèves de l\'école de Villiers-Adam. Organisation d\'événements et soutien aux activités scolaires.',
    address: 'École de Villiers-Adam',
    email: 'ape@villiers-adam.fr',
    hours: 'Sur rendez-vous',
  },
  {
    id: '2',
    name: 'Club de Tennis de Table',
    category: 'Sport',
    description: 'Club de tennis de table ouvert à tous, débutants et confirmés. Entraînements et compétitions.',
    address: 'Salle polyvalente',
    phone: '06 12 34 56 78',
    email: 'pingpong@villiers-adam.fr',
    hours: 'Mardi et jeudi 19h-22h',
  },
  {
    id: '3',
    name: 'Comité des Fêtes',
    category: 'Association',
    description: 'Organisation des événements festifs de la commune : fête du village, carnaval, vide-greniers...',
    email: 'fetes@villiers-adam.fr',
  },
  {
    id: '4',
    name: 'Boulangerie du Village',
    category: 'Commerce',
    description: 'Pain artisanal, viennoiseries et pâtisseries maison.',
    address: '5 rue de la République',
    phone: '01 34 08 XX XX',
    hours: 'Mar-Sam 7h-13h / 15h-19h, Dim 7h-13h',
  },
  {
    id: '5',
    name: 'Médecin généraliste - Dr Martin',
    category: 'Santé',
    description: 'Médecine générale. Consultations sur rendez-vous.',
    address: '12 rue de l\'Église',
    phone: '01 34 08 XX XX',
    hours: 'Lun-Ven 9h-12h / 14h-19h, Sam 9h-12h',
  },
  {
    id: '6',
    name: 'Pharmacie de Villiers-Adam',
    category: 'Santé',
    description: 'Pharmacie de proximité. Orthopédie, matériel médical.',
    address: '8 rue de la République',
    phone: '01 34 08 XX XX',
    hours: 'Lun-Sam 9h-12h30 / 14h30-19h30',
  },
  {
    id: '7',
    name: 'Bibliothèque municipale',
    category: 'Service public',
    description: 'Prêt de livres, BD, magazines. Espace multimédia et animations.',
    address: '1 Place de la Mairie',
    phone: '01 34 08 90 01',
    hours: 'Mer 14h-18h, Sam 10h-12h',
  },
  {
    id: '8',
    name: 'École élémentaire',
    category: 'Service public',
    description: 'École publique maternelle et élémentaire.',
    address: '3 rue de l\'École',
    phone: '01 34 08 90 02',
    email: 'ecole@villiers-adam.fr',
  },
];

const categories = [
  { id: 'all', label: 'Tous', icon: Building2 },
  { id: 'Association', label: 'Associations', icon: Users },
  { id: 'Sport', label: 'Sports', icon: Users },
  { id: 'Commerce', label: 'Commerces', icon: Store },
  { id: 'Santé', label: 'Santé', icon: Briefcase },
  { id: 'Service public', label: 'Services publics', icon: Building2 },
];

const categoryColors: Record<string, string> = {
  'Association': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Sport': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Commerce': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'Santé': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Service public': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export default function AnnuairePage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Annuaire
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            Retrouvez les associations, commerces et services de Villiers-Adam.
          </p>
        </div>
      </section>

      {/* Search and filters */}
      <section className="border-b bg-background sticky top-[7.5rem] z-40">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={category.id === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-full"
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Directory list */}
      <section className="container py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoEntries.map((entry) => (
            <Card key={entry.id} className="group hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight">
                    {entry.name}
                  </CardTitle>
                  <Badge
                    className={cn(
                      'shrink-0',
                      categoryColors[entry.category] || 'bg-muted'
                    )}
                  >
                    {entry.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {entry.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {entry.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {entry.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{entry.address}</span>
                    </div>
                  )}
                  {entry.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${entry.phone.replace(/\s/g, '')}`}
                        className="hover:text-primary transition-colors"
                      >
                        {entry.phone}
                      </a>
                    </div>
                  )}
                  {entry.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${entry.email}`}
                        className="hover:text-primary transition-colors truncate"
                      >
                        {entry.email}
                      </a>
                    </div>
                  )}
                  {entry.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={entry.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors truncate"
                      >
                        {entry.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                {entry.hours && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      <strong>Horaires :</strong> {entry.hours}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {demoEntries.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun résultat</h2>
            <p className="text-muted-foreground">
              Modifiez vos critères de recherche.
            </p>
          </div>
        )}
      </section>

      {/* Add entry CTA */}
      <section className="bg-muted/50 py-12">
        <div className="container text-center">
          <h2 className="font-heading text-2xl font-semibold mb-4">
            Vous souhaitez apparaître dans l'annuaire ?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Associations, commerçants, artisans : faites-vous connaître auprès des habitants de Villiers-Adam.
          </p>
          <Button asChild>
            <Link href="/contact">Nous contacter</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
