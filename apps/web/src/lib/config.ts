// Configuration statique de la mairie basée sur mairie.config.json
// Ces valeurs sont utilisées comme fallback si l'API n'est pas disponible

export const mairieConfig = {
  commune: {
    nom: 'Villiers-Adam',
    departement: "Val-d'Oise",
    region: 'Île-de-France',
    codePostal: '95840',
    siren: '219500126',
    population: 975,
  },
  contact: {
    adresse: '1 Place de la Mairie, 95840 Villiers-Adam',
    telephone: '01 34 08 00 00',
    email: 'mairie@villiers-adam.fr',
    website: 'https://villiers-adam.fr',
  },
  coordinates: {
    lat: 49.0833,
    lng: 2.3833,
  },
  horaires: {
    lundi: { ouverture: '09:00', fermeture: '12:00' },
    mardi: { ouverture: '09:00', fermeture: '12:00' },
    mercredi: { ouverture: '09:00', fermeture: '12:00' },
    jeudi: { ouverture: '14:00', fermeture: '18:00' },
    vendredi: { ouverture: '09:00', fermeture: '12:00' },
    samedi: null,
    dimanche: null,
  },
  reseauxSociaux: {
    facebook: 'https://facebook.com/villiersadam',
  },
  seo: {
    title: 'Mairie de Villiers-Adam | Site officiel',
    description:
      "Site officiel de la commune de Villiers-Adam (Val-d'Oise). Actualités, démarches administratives, événements et vie locale.",
    keywords: [
      'Villiers-Adam',
      'mairie',
      "Val-d'Oise",
      '95840',
      'commune',
      'Île-de-France',
    ],
  },
  branding: {
    logo: '/images/logo.png',
    blason: '/images/blason.svg',
    favicon: '/favicon.ico',
    colors: {
      primary: '#1e3a5f',
      secondary: '#c9a227',
      accent: '#2d5016',
    },
  },
};

export type MairieConfig = typeof mairieConfig;
