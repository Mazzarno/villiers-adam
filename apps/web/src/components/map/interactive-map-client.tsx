'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import type { InteractiveMapProps } from './interactive-map';

const InteractiveMap = dynamic<InteractiveMapProps>(
  () => import('./interactive-map').then((mod) => mod.InteractiveMap),
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

export function InteractiveMapClient(props: InteractiveMapProps) {
  return <InteractiveMap {...props} />;
}
