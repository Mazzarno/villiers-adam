import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { MapPin, Building2, GraduationCap, Heart, Store, Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Carte interactive',
  description: 'Carte interactive de Villiers-Adam : mairie, écoles, commerces et services.',
};

// Chargement dynamique de la carte (client-side uniquement)
const InteractiveMap = dynamic(
  () => import('@/components/map/interactive-map').then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-muted-foreground animate-pulse mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    ),
  }
);

// Points d'intérêt de démonstration
const markers = [
  {
    id: '1',
    lat: 49.0833,
    lng: 2.3833,
    title: 'Mairie de Villiers-Adam',
    description: '1 Place de la Mairie',
    category: 'Administration',
    icon: 'mairie' as const,
  },
  {
    id: '2',
    lat: 49.0845,
    lng: 2.3850,
    title: 'École élémentaire',
    description: '3 rue de l\'École',
    category: 'Éducation',
    icon: 'school' as const,
  },
  {
    id: '3',
    lat: 49.0825,
    lng: 2.3820,
    title: 'Cabinet médical',
    description: '12 rue de l\'Église',
    category: 'Santé',
    icon: 'health' as const,
  },
  {
    id: '4',
    lat: 49.0838,
    lng: 2.3815,
    title: 'Boulangerie du Village',
    description: '5 rue de la République',
    category: 'Commerce',
    icon: 'shop' as const,
  },
  {
    id: '5',
    lat: 49.0820,
    lng: 2.3860,
    title: 'Terrain de sport',
    description: 'Complexe sportif municipal',
    category: 'Sport',
    icon: 'sport' as const,
  },
];

const categories = [
  { id: 'mairie', label: 'Administration', icon: Building2, color: 'bg-[#1e3a5f]' },
  { id: 'school', label: 'Éducation', icon: GraduationCap, color: 'bg-[#7c3aed]' },
  { id: 'health', label: 'Santé', icon: Heart, color: 'bg-[#dc2626]' },
  { id: 'shop', label: 'Commerces', icon: Store, color: 'bg-[#f59e0b]' },
  { id: 'sport', label: 'Sports', icon: Dumbbell, color: 'bg-[#22c55e]' },
];

export default function CartePage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Carte interactive
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            Découvrez les lieux importants de Villiers-Adam : mairie, écoles, commerces, services de santé et équipements sportifs.
          </p>
        </div>
      </section>

      {/* Map section */}
      <section className="container py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <InteractiveMap
                  center={{ lat: 49.0833, lng: 2.3833 }}
                  zoom={15}
                  markers={markers}
                  className="aspect-[16/9] lg:aspect-auto lg:h-[600px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Legend and list */}
          <div className="space-y-6">
            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Légende</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.id} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full ${category.color} flex items-center justify-center`}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm">{category.label}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Points list */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Points d'intérêt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {markers.map((marker) => (
                  <div
                    key={marker.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{marker.title}</p>
                      {marker.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {marker.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="container pb-12">
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Comment utiliser la carte ?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Cliquez sur un marqueur pour voir les détails du lieu</li>
                  <li>Utilisez les boutons + et - pour zoomer</li>
                  <li>Cliquez sur l'icône de localisation pour afficher votre position</li>
                  <li>Maintenez et faites glisser pour déplacer la carte</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
