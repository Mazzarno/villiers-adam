export const villiersAdamReferenceSources = [
  {
    label: 'Page locale officielle',
    url: 'https://lapagelocale.fr/95840-villiers-adam',
  },
  {
    label: 'Fiche Service-Public',
    url: 'https://lannuaire.service-public.fr/ile-de-france/val-d-oise/20c972bb-d92d-400e-8a36-8d022ecff24d',
  },
  {
    label: 'PLU (document officiel)',
    url: 'https://lapagelocale.fr/imgcom/95678/document/95678_125_30795_RDVVAD_4_3_tome_3_reglement.pdf',
  },
];

export const villiersAdamTownhall = {
  communeName: 'Villiers-Adam',
  postalCode: '95840',
  inseeCode: '95678',
  department: "Val-d'Oise",
  region: 'Ile-de-France',
  address: 'Place Victor-Hugo, 95840 Villiers-Adam',
  administrativeAddress: '12 rue Aristide-Briand, 95840 Villiers-Adam',
  phone: '01 34 69 28 17',
  email: 'mairie@villiers-adam.fr',
  website: 'https://lapagelocale.fr/95840-villiers-adam',
  coordinates: {
    lat: 49.064213,
    lng: 2.235307,
  },
} as const;

export const villiersAdamCommuneProfile = {
  populationMunicipale: 858,
  populationTotale: 874,
  gentile: 'Villiers-Adamois',
  superficie: 9.82,
  altitude: { min: 47, max: 157, moyenne: 102 },
  intercommunalite: "Communaute de communes de la Vallee de l'Oise et des Trois Forets",
  canton: "L'Isle-Adam",
  arrondissement: 'Pontoise',
  maire: {
    nom: 'Bruno MACE',
    mandat: '2020-2026',
  },
} as const;

export const villiersAdamOpeningHours = [
  { day: 'Lundi', hours: '14h00-17h00', isOpen: true },
  { day: 'Mardi', hours: 'Fermeture hebdomadaire', isOpen: false },
  { day: 'Mercredi', hours: '10h00-12h00', isOpen: true },
  { day: 'Jeudi', hours: '14h00-17h00', isOpen: true },
  { day: 'Vendredi', hours: '10h00-12h00', isOpen: true },
  { day: 'Samedi', hours: '10h00-12h00', isOpen: true },
  { day: 'Dimanche', hours: 'Fermeture hebdomadaire', isOpen: false },
] as const;

export const villiersAdamOpeningHoursNote =
  'Fermeture de la mairie le samedi pendant les mois de juillet et aout.';

export const villiersAdamOpeningHoursStructured = {
  lundi: { matin: null, aprem: { ouverture: '14:00', fermeture: '17:00' } },
  mardi: null,
  mercredi: { matin: { ouverture: '10:00', fermeture: '12:00' }, aprem: null },
  jeudi: { matin: null, aprem: { ouverture: '14:00', fermeture: '17:00' } },
  vendredi: { matin: { ouverture: '10:00', fermeture: '12:00' }, aprem: null },
  samedi: {
    matin: { ouverture: '10:00', fermeture: '12:00' },
    aprem: null,
    note: 'Ferme en juillet/aout',
  },
  dimanche: null,
} as const;

export const villiersAdamReferenceDocuments = [
  {
    title: 'Reglement du PLU (version 2025)',
    url: 'https://lapagelocale.fr/imgcom/95678/document/95678_125_30795_RDVVAD_4_3_tome_3_reglement.pdf',
  },
  {
    title: 'Arrete municipal 2018',
    url: 'https://lapagelocale.fr/imgcom/95678/document/arrte_municipal_2018__5_.pdf',
  },
  {
    title: 'Bulletin municipal (juin 2022)',
    url: 'https://lapagelocale.fr/imgcom/95678/document/BREF_DE_JUIN_2022_BIS.pdf',
  },
] as const;
