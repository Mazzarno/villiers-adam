'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Marker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  category?: string;
  icon?: 'default' | 'mairie' | 'school' | 'health' | 'shop' | 'sport';
}

export interface InteractiveMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  className?: string;
  showControls?: boolean;
  onMarkerClick?: (marker: Marker) => void;
}

const categoryColors: Record<string, string> = {
  mairie: '#1e3a5f',
  school: '#7c3aed',
  health: '#dc2626',
  shop: '#f59e0b',
  sport: '#b87333',
  default: '#1e3a5f',
};

export function InteractiveMap({
  center = { lat: 49.064213, lng: 2.235307 },
  zoom = 15,
  markers = [],
  className,
  showControls = true,
  onMarkerClick,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const initialCenter = useRef(center);
  const initialZoom = useRef(zoom);
  const initialMarkers = useRef(markers);
  const initialOnMarkerClick = useRef(onMarkerClick);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Chargement dynamique de Leaflet côté client uniquement
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      const L = (await import('leaflet')).default;

      if (!mapRef.current || mapInstanceRef.current) return;

      // Initialisation de la carte
      const map = L.map(mapRef.current, {
        center: [initialCenter.current.lat, initialCenter.current.lng],
        zoom: initialZoom.current,
        zoomControl: false,
        attributionControl: true,
      });

      // Tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Création des icônes personnalisées
      const createIcon = (color: string) => {
        return L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">
              <div style="
                transform: rotate(45deg);
                color: white;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
              ">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });
      };

      // Ajout des marqueurs
      initialMarkers.current.forEach((marker) => {
        const color = categoryColors[marker.icon || 'default'] || categoryColors.default;
        const icon = createIcon(color);

        const leafletMarker = L.marker([marker.lat, marker.lng], { icon }).addTo(map);

        // Popup
        const popupContent = `
          <div class="p-2">
            <h3 class="font-semibold text-base mb-1">${marker.title}</h3>
            ${marker.description ? `<p class="text-sm text-gray-600">${marker.description}</p>` : ''}
            ${marker.category ? `<span class="inline-block mt-2 text-xs bg-gray-100 px-2 py-1 rounded">${marker.category}</span>` : ''}
          </div>
        `;

        leafletMarker.bindPopup(popupContent);

        if (initialOnMarkerClick.current) {
          leafletMarker.on('click', () => initialOnMarkerClick.current?.(marker));
        }
      });

      mapInstanceRef.current = map;
      setIsLoaded(true);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Mise à jour du centre si les props changent
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, zoom]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstanceRef.current) {
          import('leaflet').then((L) => {
            if (!mapInstanceRef.current) return;

            // Centrer sur la position
            mapInstanceRef.current.setView([latitude, longitude], 16);

            // Ajouter un marqueur de position
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="
                  background-color: #3b82f6;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 2px 5px rgba(0,0,0,0.3);
                "></div>
              `,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });

            L.marker([latitude, longitude], { icon: userIcon })
              .addTo(mapInstanceRef.current)
              .bindPopup('Votre position');
          });
        }
      },
      () => {
        alert('Impossible d\'obtenir votre position.');
      }
    );
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    }
  };

  return (
    <div className={cn('relative rounded-lg overflow-hidden', className)}>
      {/* Conteneur de la carte */}
      <div
        ref={mapRef}
        className="w-full h-full min-h-[400px]"
        style={{ background: '#f0f0f0' }}
      />

      {/* Contrôles de la carte */}
      {showControls && isLoaded && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
          <Button
            variant="secondary"
            size="icon"
            className="h-11 w-11 bg-background shadow-md"
            onClick={handleZoomIn}
            title="Zoomer"
            aria-label="Zoomer la carte"
          >
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-11 w-11 bg-background shadow-md"
            onClick={handleZoomOut}
            title="Dézoomer"
            aria-label="Dézoomer la carte"
          >
            <ZoomOut className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-11 w-11 bg-background shadow-md"
            onClick={handleLocate}
            title="Ma position"
            aria-label="Afficher ma position sur la carte"
          >
            <Locate className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-11 w-11 bg-background shadow-md"
            onClick={handleResetView}
            title="Recentrer"
            aria-label="Recentrer la carte"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Indicateur de chargement */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-muted-foreground animate-pulse mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
          </div>
        </div>
      )}
    </div>
  );
}
