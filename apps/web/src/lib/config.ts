// Types et helpers horaires partagés.
// Politique: aucune donnée municipale statique dans ce module.

export type HoraireCreneau = {
  ouverture: string;
  fermeture: string;
};

export type HoraireJour = {
  matin: HoraireCreneau | null;
  aprem: HoraireCreneau | null;
  note?: string;
} | null;

export function formatHoraireJour(jour: HoraireJour): string {
  if (!jour) return 'Ferme';

  const parts: string[] = [];
  if (jour.matin) {
    parts.push(`${jour.matin.ouverture}-${jour.matin.fermeture}`);
  }
  if (jour.aprem) {
    parts.push(`${jour.aprem.ouverture}-${jour.aprem.fermeture}`);
  }

  let result = parts.join(' / ');
  if (jour.note) {
    result += ` (${jour.note})`;
  }

  return result || 'Ferme';
}
