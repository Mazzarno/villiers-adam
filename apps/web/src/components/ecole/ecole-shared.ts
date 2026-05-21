import {
  Baby,
  Building,
  Bus,
  PartyPopper,
  School,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';

export const ECOLE_SECTION_ORDER = [
  'petite-enfance',
  'ecole-primaire',
  'centre-de-loisirs',
  'college-lycee',
  'recensement',
  'transport-scolaire',
] as const;

export type EcoleSectionKey = (typeof ECOLE_SECTION_ORDER)[number];

export type EcoleSectionMeta = {
  title: string;
  defaultDescription: string;
  icon: LucideIcon;
  iconWrapperClassName: string;
  iconClassName: string;
};

export const ECOLE_SECTION_META: Record<EcoleSectionKey, EcoleSectionMeta> = {
  'petite-enfance': {
    title: 'Petite enfance',
    defaultDescription: 'Modes de garde et accompagnement des tout-petits.',
    icon: Baby,
    iconWrapperClassName: 'bg-pink-50 border-pink-200',
    iconClassName: 'text-pink-600',
  },
  'ecole-primaire': {
    title: 'Ecole primaire',
    defaultDescription: 'Informations scolaires de la maternelle au CM2.',
    icon: School,
    iconWrapperClassName: 'bg-villiers-blue/10 border-villiers-blue/20',
    iconClassName: 'text-villiers-blue',
  },
  'centre-de-loisirs': {
    title: 'Centre de loisirs',
    defaultDescription: 'Accueil periscolaire et activites des enfants.',
    icon: PartyPopper,
    iconWrapperClassName: 'bg-villiers-gold/10 border-villiers-gold/20',
    iconClassName: 'text-villiers-gold',
  },
  'college-lycee': {
    title: 'College et lycee',
    defaultDescription: 'Etablissements de secteur et informations pratiques.',
    icon: Building,
    iconWrapperClassName: 'bg-villiers-green/10 border-villiers-green/20',
    iconClassName: 'text-villiers-green',
  },
  recensement: {
    title: 'Recensement',
    defaultDescription: 'Demarches de recensement citoyen des jeunes.',
    icon: UserCheck,
    iconWrapperClassName: 'bg-villiers-blue/10 border-villiers-blue/20',
    iconClassName: 'text-villiers-blue',
  },
  'transport-scolaire': {
    title: 'Transport scolaire',
    defaultDescription: 'Informations de transport pour les eleves.',
    icon: Bus,
    iconWrapperClassName: 'bg-orange-50 border-orange-200',
    iconClassName: 'text-orange-600',
  },
};

export function isEcoleSectionKey(value: string): value is EcoleSectionKey {
  return (ECOLE_SECTION_ORDER as readonly string[]).includes(value);
}
