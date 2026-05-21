export interface HeroSlide {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  objectPosition: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    image: '/mairie.jpg',
    alt: 'Façade de la mairie de Villiers-Adam',
    eyebrow: 'Site officiel',
    title: 'Bienvenue à Villiers-Adam',
    description:
      'Retrouvez les actualités, démarches, services municipaux et informations pratiques de votre commune.',
    primaryLabel: 'Accéder aux démarches',
    primaryHref: '/demarches',
    secondaryLabel: 'Contacter la mairie',
    secondaryHref: '/contact',
    objectPosition: 'center center',
  },
  {
    image: '/chemin.jpg',
    alt: 'Chemin arboré au cœur du village de Villiers-Adam',
    eyebrow: 'Cadre de vie',
    title: "Un village au cœur du Val-d'Oise",
    description:
      'Un environnement préservé, des services de proximité et une vie locale à taille humaine.',
    primaryLabel: 'Découvrir la commune',
    primaryHref: '/mairie',
    secondaryLabel: 'Vie quotidienne',
    secondaryHref: '/vie-quotidienne',
    objectPosition: 'center center',
  },
  {
    image: '/lavoir.jpg',
    alt: 'Lavoir et paysage patrimonial de Villiers-Adam',
    eyebrow: 'Patrimoine & nature',
    title: 'Entre patrimoine, nature et vie locale',
    description:
      'Explorez les lieux, événements et activités qui rythment la vie de Villiers-Adam.',
    primaryLabel: 'Culture & loisirs',
    primaryHref: '/culture-loisirs',
    secondaryLabel: 'Voir les événements',
    secondaryHref: '/evenements',
    objectPosition: 'center center',
  },
];
