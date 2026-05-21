import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(d);
}

export function formatDateShort(date: Date | string): string {
  return formatDate(date, { day: 'numeric', month: 'short' });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '…';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formate les horaires d'ouverture provenant de l'API.
 * Supporte : string, string[], Record<string, string>, et le format structuré
 * { jour: { matin: { ouverture, fermeture }, aprem: { ouverture, fermeture } } }
 */
export function formatOpeningHours(hours: unknown): { label: string; value: string }[] | null {
  if (!hours) return null;

  if (typeof hours === 'string') {
    return [{ label: 'Horaires', value: hours }];
  }

  if (Array.isArray(hours)) {
    if (hours.length === 0) return null;
    if (typeof hours[0] === 'string') {
      return hours.map((value, index) => ({ label: `Jour ${index + 1}`, value: String(value) }));
    }
    // Array of { day, morning, afternoon } format (SiteConfig)
    return hours.map((entry) => {
      const parts: string[] = [];
      if (entry.morning) parts.push(entry.morning);
      if (entry.afternoon) parts.push(entry.afternoon);
      return { label: entry.day || `Jour`, value: parts.join(' / ') || 'Fermé' };
    });
  }

  if (typeof hours === 'object' && hours !== null) {
    const entries = Object.entries(hours as Record<string, unknown>);
    if (entries.length === 0) return null;

    return entries.map(([day, value]) => {
      if (typeof value === 'string') {
        return { label: day, value };
      }
      // Structured format: { matin: { ouverture, fermeture }, aprem: { ouverture, fermeture } }
      if (value && typeof value === 'object') {
        const slot = value as { matin?: { ouverture: string; fermeture: string } | null; aprem?: { ouverture: string; fermeture: string } | null; note?: string };
        if (slot.matin === undefined && slot.aprem === undefined) {
          return { label: day, value: String(value) };
        }
        const parts: string[] = [];
        if (slot.matin) parts.push(`${slot.matin.ouverture}-${slot.matin.fermeture}`);
        if (slot.aprem) parts.push(`${slot.aprem.ouverture}-${slot.aprem.fermeture}`);
        let result = parts.join(' / ') || 'Fermé';
        if (slot.note) result += ` (${slot.note})`;
        return { label: day.charAt(0).toUpperCase() + day.slice(1), value: result };
      }
      if (value === null) {
        return { label: day.charAt(0).toUpperCase() + day.slice(1), value: 'Fermé' };
      }
      return { label: day, value: String(value) };
    });
  }

  return null;
}
