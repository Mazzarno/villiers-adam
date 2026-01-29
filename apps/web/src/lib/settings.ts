import api from './api';

export interface PublicSettings {
  siteName: string;
  branding: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
  };
  accessibility: {
    seniorMode?: boolean;
    dyslexicMode?: boolean;
    nightMode?: boolean;
  };
  contactEmail: string;
  contactPhone: string;
  address: {
    street?: string;
    city?: string;
    postalCode?: string;
  };
}

let cachedSettings: PublicSettings | null = null;

export async function getPublicSettings(): Promise<PublicSettings | null> {
  // Retourner le cache si disponible (pour éviter trop d'appels API)
  if (cachedSettings) {
    return cachedSettings;
  }

  try {
    const settings = await api.settings.getPublic();
    cachedSettings = settings as PublicSettings;
    return cachedSettings;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres publics:', error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      siteName: 'Villiers-Adam',
      branding: {},
      accessibility: {
        seniorMode: true,
        dyslexicMode: false,
        nightMode: true,
      },
      contactEmail: 'mairie@villiers-adam.fr',
      contactPhone: '01 34 67 00 11',
      address: {},
    };
  }
}

// Fonction pour forcer le rechargement des settings
export function clearSettingsCache() {
  cachedSettings = null;
}
