import Link from 'next/link';
import { cn } from '@/lib/utils';

type MapEmbedProps = {
  lat: number;
  lng: number;
  label?: string;
  className?: string;
  zoom?: number;
};

const buildEmbedUrl = (lat: number, lng: number, zoom: number) => {
  const delta = 0.01;
  const minLng = lng - delta;
  const minLat = lat - delta;
  const maxLng = lng + delta;
  const maxLat = lat + delta;
  const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${lat},${lng}&zoom=${zoom}`;
};

export function MapEmbed({ lat, lng, label = 'Voir sur la carte', className, zoom = 15 }: MapEmbedProps) {
  const embedUrl = buildEmbedUrl(lat, lng, zoom);
  const mapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;

  return (
    <div className={cn('relative overflow-hidden rounded-lg border border-border/50', className)}>
      <iframe
        title={label}
        src={embedUrl}
        className="h-full w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="absolute bottom-3 right-3 rounded-full bg-background/90 px-3 py-1 text-xs text-foreground shadow-sm">
        <Link href={mapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {label}
        </Link>
      </div>
    </div>
  );
}
