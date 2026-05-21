import { Metadata } from 'next';
import { MapPin, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveMapClient } from '@/components/map/interactive-map-client';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Carte interactive',
  description: 'Carte interactive de Villiers-Adam : mairie, écoles, commerces et services.',
};

// Points d'interet references
const markers = [
  {
    id: '1',
    lat: 49.064213,
    lng: 2.235307,
    title: 'Mairie de Villiers-Adam',
    description: 'Place Victor-Hugo',
    category: 'Administration',
    icon: 'mairie' as const,
  },
];

const categories = [
  { id: 'mairie', label: 'Administration', icon: Building2, color: 'bg-[#1e3a5f]' },
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
            Localisation de la mairie de Villiers-Adam et des points d&apos;interet publies par la commune.
          </p>
        </div>
      </section>

      {/* Map section */}
      <section className="container py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3 min-w-0">
            <Card className="overflow-hidden min-w-0">
              <CardContent className="p-0">
                <InteractiveMapClient
                  center={{ lat: 49.064213, lng: 2.235307 }}
                  zoom={15}
                  markers={markers}
                  className="aspect-[16/9] lg:aspect-auto lg:h-[600px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Legend and list */}
          <div className="space-y-6 min-w-0">
            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg break-words">Légende</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.id} className="flex items-center gap-3">
                      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', category.color)}>
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
                <CardTitle className="text-lg break-words">Points d&apos;intérêt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {markers.map((marker) => (
                  <div
                    key={marker.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm break-words leading-snug">{marker.title}</p>
                      {marker.description && (
                        <p className="text-xs text-muted-foreground break-words leading-snug">
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
                  <li>Cliquez sur l&apos;icône de localisation pour afficher votre position</li>
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
