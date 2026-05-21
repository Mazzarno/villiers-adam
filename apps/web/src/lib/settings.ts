import api from './api';
import type { HoraireJour } from './config';

type HoraireCreneau = {
  ouverture: string;
  fermeture: string;
};

type CommuneProfile = {
  nom: string;
  departement: string;
  region: string;
  codePostal: string;
  siren: string;
  population: number;
  codeInsee: string;
  gentile: string;
  superficie: number;
  altitude: {
    min: number;
    max: number;
    moyenne: number;
  };
  intercommunalite: string;
  canton: string;
  arrondissement: string;
  populationTotale?: number;
};

type ContactProfile = {
  adresse: string;
  telephone: string;
  email: string;
  website: string;
  fax: string;
};

type CoordinatesProfile = {
  lat: number;
  lng: number;
};

type MayorProfile = {
  nom: string;
  mandat: string;
};

type SchoolProfile = {
  nom: string;
  adresse: string;
};

export interface InfosPratiquesEmergencyNumber {
  label: string;
  value: string;
  description?: string;
  priority?: number;
}

export interface InfosPratiquesWasteItem {
  title: string;
  description?: string;
  schedule?: string;
  location?: string;
  linkLabel?: string;
  linkUrl?: string;
  priority?: number;
}

export interface InfosPratiquesLocalRule {
  title: string;
  description: string;
  priority?: number;
}

export interface InfosPratiquesUsefulLink {
  label: string;
  url: string;
  description?: string;
  priority?: number;
}

export interface InfosPratiquesDocument {
  title: string;
  description?: string;
  mediaId?: string;
  url?: string;
  priority?: number;
}

export interface InfosPratiquesContent {
  title?: string;
  intro?: string;
  emergencyNumbers?: InfosPratiquesEmergencyNumber[];
  waste?: InfosPratiquesWasteItem[];
  localRules?: InfosPratiquesLocalRule[];
  usefulLinks?: InfosPratiquesUsefulLink[];
  documents?: InfosPratiquesDocument[];
  updatedAt?: string;
}

export interface EcoleEnfanceLink {
  label: string;
  url: string;
}

export interface EcoleEnfanceDocument {
  title: string;
  description?: string;
  mediaId?: string;
  url?: string;
}

export interface EcoleEnfanceSection {
  key: string;
  title: string;
  description?: string;
  content?: string;
  links?: EcoleEnfanceLink[];
  documents?: EcoleEnfanceDocument[];
  priority?: number;
}

export interface EcoleEnfanceSchoolContact {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  director?: string;
}

export interface EcoleEnfanceContent {
  title?: string;
  intro?: string;
  schoolContact?: EcoleEnfanceSchoolContact;
  sections?: EcoleEnfanceSection[];
  updatedAt?: string;
}

export type RestaurationScolaireMenuFormat = 'TEXT' | 'IMAGE' | 'PDF' | 'MIXED';

export interface RestaurationScolaireMenu {
  weekLabel?: string;
  validFrom?: string;
  validTo?: string;
  format?: RestaurationScolaireMenuFormat;
  textContent?: string;
  imageMediaId?: string;
  imageUrl?: string;
  pdfMediaId?: string;
  pdfUrl?: string;
  updatedAt?: string;
}

export interface RestaurationScolaireDocument {
  title: string;
  description?: string;
  mediaId?: string;
  url?: string;
}

export interface RestaurationScolaireContent {
  title?: string;
  intro?: string;
  menuCourant?: RestaurationScolaireMenu;
  tarifs?: string;
  inscription?: string;
  allergies?: string;
  engagements?: string;
  documents?: RestaurationScolaireDocument[];
  updatedAt?: string;
}

export interface SportsHighlight {
  title: string;
  description?: string;
  priority?: number;
}

export interface SportsUsefulLink {
  label: string;
  url: string;
  description?: string;
  priority?: number;
}

export interface SportsDocument {
  title: string;
  description?: string;
  mediaId?: string;
  url?: string;
  priority?: number;
}

export interface SportsContent {
  title?: string;
  intro?: string;
  description?: string;
  equipmentTitle?: string;
  associationsTitle?: string;
  associationIds?: string[];
  highlights?: SportsHighlight[];
  usefulLinks?: SportsUsefulLink[];
  documents?: SportsDocument[];
  updatedAt?: string;
}

export interface VieQuotidienneProfile {
  infosPratiques?: InfosPratiquesContent;
  ecoleEnfance?: EcoleEnfanceContent;
  restaurationScolaire?: RestaurationScolaireContent;
}

export interface CultureLoisirsProfile {
  sports?: SportsContent;
}

export interface MunicipalityProfile {
  commune?: Partial<CommuneProfile>;
  contact?: Partial<ContactProfile>;
  coordinates?: CoordinatesProfile;
  horaires?: Record<string, HoraireJour>;
  maire?: Partial<MayorProfile>;
  ecole?: Partial<SchoolProfile>;
  vieQuotidienne?: VieQuotidienneProfile;
  cultureLoisirs?: CultureLoisirsProfile;
  metadata?: {
    source?: string;
    sourceUrl?: string;
    updatedAt?: string;
  };
}

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
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
  };
  municipalityProfile?: MunicipalityProfile;
}

let cachedSettings: PublicSettings | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeCreneau(value: unknown): HoraireCreneau | null {
  if (value === null) return null;
  if (!isRecord(value)) return null;

  const ouverture = typeof value.ouverture === 'string' ? value.ouverture : undefined;
  const fermeture = typeof value.fermeture === 'string' ? value.fermeture : undefined;

  if (!ouverture || !fermeture) return null;

  return {
    ouverture,
    fermeture,
  };
}

function sanitizeHoraireJour(value: unknown): HoraireJour {
  if (value === null) return null;
  if (!isRecord(value)) return null;

  const matin = sanitizeCreneau(value.matin);
  const aprem = sanitizeCreneau(value.aprem);
  const note = typeof value.note === 'string' ? value.note : undefined;

  if (!matin && !aprem) return null;

  return {
    matin,
    aprem,
    ...(note ? { note } : {}),
  };
}

function parseHoraires(value: unknown): Record<string, HoraireJour> | undefined {
  if (!isRecord(value)) return undefined;

  const horaires = Object.fromEntries(
    Object.entries(value).map(([day, schedule]) => [day, sanitizeHoraireJour(schedule)]),
  );

  return Object.keys(horaires).length > 0
    ? (horaires as Record<string, HoraireJour>)
    : undefined;
}

function parseAddress(value: unknown): PublicSettings['address'] | undefined {
  if (typeof value === 'string') {
    return { street: value };
  }
  if (!isRecord(value)) {
    return undefined;
  }

  const street =
    typeof value.street === 'string'
      ? value.street
      : typeof value.ligne1 === 'string'
        ? value.ligne1
        : undefined;

  const city =
    typeof value.city === 'string'
      ? value.city
      : typeof value.ville === 'string'
        ? value.ville
        : undefined;

  const postalCode =
    typeof value.postalCode === 'string'
      ? value.postalCode
      : typeof value.codePostal === 'string'
        ? value.codePostal
        : undefined;

  if (!street && !city && !postalCode) {
    return undefined;
  }

  return { street, city, postalCode };
}

function parseOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function parseEmergencyNumbers(value: unknown): InfosPratiquesEmergencyNumber[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries: InfosPratiquesEmergencyNumber[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const label = parseOptionalString(item.label);
    const phoneValue = parseOptionalString(item.value);
    if (!label || !phoneValue) continue;

    const entry: InfosPratiquesEmergencyNumber = {
      label,
      value: phoneValue,
    };

    const description = parseOptionalString(item.description);
    const priority = parseOptionalNumber(item.priority);
    if (description) entry.description = description;
    if (priority !== undefined) entry.priority = priority;
    entries.push(entry);
  }
  return entries.length > 0 ? entries : undefined;
}

function parseWasteItems(value: unknown): InfosPratiquesWasteItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries: InfosPratiquesWasteItem[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const title = parseOptionalString(item.title);
    if (!title) continue;

    const entry: InfosPratiquesWasteItem = { title };
    const description = parseOptionalString(item.description);
    const schedule = parseOptionalString(item.schedule);
    const location = parseOptionalString(item.location);
    const linkLabel = parseOptionalString(item.linkLabel);
    const linkUrl = parseOptionalString(item.linkUrl);
    const priority = parseOptionalNumber(item.priority);

    if (description) entry.description = description;
    if (schedule) entry.schedule = schedule;
    if (location) entry.location = location;
    if (linkLabel) entry.linkLabel = linkLabel;
    if (linkUrl) entry.linkUrl = linkUrl;
    if (priority !== undefined) entry.priority = priority;
    entries.push(entry);
  }
  return entries.length > 0 ? entries : undefined;
}

function parseLocalRules(value: unknown): InfosPratiquesLocalRule[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries: InfosPratiquesLocalRule[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const title = parseOptionalString(item.title);
    const description = parseOptionalString(item.description);
    if (!title || !description) continue;

    const entry: InfosPratiquesLocalRule = { title, description };
    const priority = parseOptionalNumber(item.priority);
    if (priority !== undefined) entry.priority = priority;
    entries.push(entry);
  }
  return entries.length > 0 ? entries : undefined;
}

function parseUsefulLinks(value: unknown): InfosPratiquesUsefulLink[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries: InfosPratiquesUsefulLink[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const label = parseOptionalString(item.label);
    const url = parseOptionalString(item.url);
    if (!label || !url) continue;

    const entry: InfosPratiquesUsefulLink = { label, url };
    const description = parseOptionalString(item.description);
    const priority = parseOptionalNumber(item.priority);
    if (description) entry.description = description;
    if (priority !== undefined) entry.priority = priority;
    entries.push(entry);
  }
  return entries.length > 0 ? entries : undefined;
}

function parseDocuments(value: unknown): InfosPratiquesDocument[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries: InfosPratiquesDocument[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const title = parseOptionalString(item.title);
    if (!title) continue;

    const entry: InfosPratiquesDocument = { title };
    const description = parseOptionalString(item.description);
    const mediaId = parseOptionalString(item.mediaId);
    const url = parseOptionalString(item.url);
    const priority = parseOptionalNumber(item.priority);

    if (description) entry.description = description;
    if (mediaId) entry.mediaId = mediaId;
    if (url) entry.url = url;
    if (priority !== undefined) entry.priority = priority;
    entries.push(entry);
  }
  return entries.length > 0 ? entries : undefined;
}

function parseEcoleLinks(value: unknown): EcoleEnfanceLink[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries: EcoleEnfanceLink[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const label = parseOptionalString(item.label);
    const url = parseOptionalString(item.url);
    if (!label || !url) continue;
    entries.push({ label, url });
  }
  return entries.length > 0 ? entries : undefined;
}

function parseEcoleDocuments(value: unknown): EcoleEnfanceDocument[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries: EcoleEnfanceDocument[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const title = parseOptionalString(item.title);
    if (!title) continue;

    const entry: EcoleEnfanceDocument = { title };
    const description = parseOptionalString(item.description);
    const mediaId = parseOptionalString(item.mediaId);
    const url = parseOptionalString(item.url);

    if (description) entry.description = description;
    if (mediaId) entry.mediaId = mediaId;
    if (url) entry.url = url;
    entries.push(entry);
  }
  return entries.length > 0 ? entries : undefined;
}

function parseEcoleSections(value: unknown): EcoleEnfanceSection[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries: EcoleEnfanceSection[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const key = parseOptionalString(item.key);
    const title = parseOptionalString(item.title);
    if (!key || !title) continue;

    const entry: EcoleEnfanceSection = {
      key,
      title,
    };
    const description = parseOptionalString(item.description);
    const content = parseOptionalString(item.content);
    const links = parseEcoleLinks(item.links);
    const documents = parseEcoleDocuments(item.documents);
    const priority = parseOptionalNumber(item.priority);

    if (description) entry.description = description;
    if (content) entry.content = content;
    if (links) entry.links = links;
    if (documents) entry.documents = documents;
    if (priority !== undefined) entry.priority = priority;
    entries.push(entry);
  }
  return entries.length > 0 ? entries : undefined;
}

function parseEcoleSchoolContact(value: unknown): EcoleEnfanceSchoolContact | undefined {
  if (!isRecord(value)) return undefined;
  const name = parseOptionalString(value.name);
  const address = parseOptionalString(value.address);
  const phone = parseOptionalString(value.phone);
  const email = parseOptionalString(value.email);
  const director = parseOptionalString(value.director);

  if (!name && !address && !phone && !email && !director) return undefined;
  return { name, address, phone, email, director };
}

function parseEcoleEnfance(value: unknown): EcoleEnfanceContent | undefined {
  if (!isRecord(value)) return undefined;

  const title = parseOptionalString(value.title);
  const intro = parseOptionalString(value.intro);
  const schoolContact = parseEcoleSchoolContact(value.schoolContact);
  const sections = parseEcoleSections(value.sections);
  const updatedAt = parseOptionalString(value.updatedAt);

  if (!title && !intro && !schoolContact && !sections && !updatedAt) {
    return undefined;
  }

  return {
    title,
    intro,
    schoolContact,
    sections,
    updatedAt,
  };
}

function parseRestaurationMenuFormat(value: unknown): RestaurationScolaireMenuFormat | undefined {
  if (typeof value !== 'string') return undefined;
  switch (value) {
    case 'TEXT':
    case 'IMAGE':
    case 'PDF':
    case 'MIXED':
      return value;
    default:
      return undefined;
  }
}

function parseRestaurationMenu(value: unknown): RestaurationScolaireMenu | undefined {
  if (!isRecord(value)) return undefined;

  const weekLabel = parseOptionalString(value.weekLabel);
  const validFrom = parseOptionalString(value.validFrom);
  const validTo = parseOptionalString(value.validTo);
  const format = parseRestaurationMenuFormat(value.format);
  const textContent = parseOptionalString(value.textContent);
  const imageMediaId = parseOptionalString(value.imageMediaId);
  const imageUrl = parseOptionalString(value.imageUrl);
  const pdfMediaId = parseOptionalString(value.pdfMediaId);
  const pdfUrl = parseOptionalString(value.pdfUrl);
  const updatedAt = parseOptionalString(value.updatedAt);

  if (
    !weekLabel &&
    !validFrom &&
    !validTo &&
    !format &&
    !textContent &&
    !imageMediaId &&
    !imageUrl &&
    !pdfMediaId &&
    !pdfUrl &&
    !updatedAt
  ) {
    return undefined;
  }

  return {
    weekLabel,
    validFrom,
    validTo,
    format,
    textContent,
    imageMediaId,
    imageUrl,
    pdfMediaId,
    pdfUrl,
    updatedAt,
  };
}

function parseRestaurationDocuments(value: unknown): RestaurationScolaireDocument[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries: RestaurationScolaireDocument[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const title = parseOptionalString(item.title);
    if (!title) continue;

    const entry: RestaurationScolaireDocument = { title };
    const description = parseOptionalString(item.description);
    const mediaId = parseOptionalString(item.mediaId);
    const url = parseOptionalString(item.url);

    if (description) entry.description = description;
    if (mediaId) entry.mediaId = mediaId;
    if (url) entry.url = url;
    entries.push(entry);
  }
  return entries.length > 0 ? entries : undefined;
}

function parseRestaurationScolaire(value: unknown): RestaurationScolaireContent | undefined {
  if (!isRecord(value)) return undefined;

  const title = parseOptionalString(value.title);
  const intro = parseOptionalString(value.intro);
  const menuCourant = parseRestaurationMenu(value.menuCourant);
  const tarifs = parseOptionalString(value.tarifs);
  const inscription = parseOptionalString(value.inscription);
  const allergies = parseOptionalString(value.allergies);
  const engagements = parseOptionalString(value.engagements);
  const documents = parseRestaurationDocuments(value.documents);
  const updatedAt = parseOptionalString(value.updatedAt);

  if (
    !title &&
    !intro &&
    !menuCourant &&
    !tarifs &&
    !inscription &&
    !allergies &&
    !engagements &&
    !documents &&
    !updatedAt
  ) {
    return undefined;
  }

  return {
    title,
    intro,
    menuCourant,
    tarifs,
    inscription,
    allergies,
    engagements,
    documents,
    updatedAt,
  };
}

function parseSportsHighlights(value: unknown): SportsHighlight[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries: SportsHighlight[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const title = parseOptionalString(item.title);
    if (!title) continue;

    const entry: SportsHighlight = { title };
    const description = parseOptionalString(item.description);
    const priority = parseOptionalNumber(item.priority);
    if (description) entry.description = description;
    if (priority !== undefined) entry.priority = priority;
    entries.push(entry);
  }
  return entries.length > 0 ? entries : undefined;
}

function parseSportsUsefulLinks(value: unknown): SportsUsefulLink[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries: SportsUsefulLink[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const label = parseOptionalString(item.label);
    const url = parseOptionalString(item.url);
    if (!label || !url) continue;

    const entry: SportsUsefulLink = { label, url };
    const description = parseOptionalString(item.description);
    const priority = parseOptionalNumber(item.priority);
    if (description) entry.description = description;
    if (priority !== undefined) entry.priority = priority;
    entries.push(entry);
  }
  return entries.length > 0 ? entries : undefined;
}

function parseSportsDocuments(value: unknown): SportsDocument[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries: SportsDocument[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const title = parseOptionalString(item.title);
    if (!title) continue;

    const entry: SportsDocument = { title };
    const description = parseOptionalString(item.description);
    const mediaId = parseOptionalString(item.mediaId);
    const url = parseOptionalString(item.url);
    const priority = parseOptionalNumber(item.priority);

    if (description) entry.description = description;
    if (mediaId) entry.mediaId = mediaId;
    if (url) entry.url = url;
    if (priority !== undefined) entry.priority = priority;
    entries.push(entry);
  }
  return entries.length > 0 ? entries : undefined;
}

function parseAssociationIds(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    ids.push(trimmed);
  }

  return ids.length > 0 ? ids : undefined;
}

function parseSports(value: unknown): SportsContent | undefined {
  if (!isRecord(value)) return undefined;

  const title = parseOptionalString(value.title);
  const intro = parseOptionalString(value.intro);
  const description = parseOptionalString(value.description);
  const equipmentTitle = parseOptionalString(value.equipmentTitle);
  const associationsTitle = parseOptionalString(value.associationsTitle);
  const associationIds = parseAssociationIds(value.associationIds);
  const highlights = parseSportsHighlights(value.highlights);
  const usefulLinks = parseSportsUsefulLinks(value.usefulLinks);
  const documents = parseSportsDocuments(value.documents);
  const updatedAt = parseOptionalString(value.updatedAt);

  if (
    !title &&
    !intro &&
    !description &&
    !equipmentTitle &&
    !associationsTitle &&
    !associationIds &&
    !highlights &&
    !usefulLinks &&
    !documents &&
    !updatedAt
  ) {
    return undefined;
  }

  return {
    title,
    intro,
    description,
    equipmentTitle,
    associationsTitle,
    associationIds,
    highlights,
    usefulLinks,
    documents,
    updatedAt,
  };
}

function parseInfosPratiques(value: unknown): InfosPratiquesContent | undefined {
  if (!isRecord(value)) return undefined;

  const title = parseOptionalString(value.title);
  const intro = parseOptionalString(value.intro);
  const emergencyNumbers = parseEmergencyNumbers(value.emergencyNumbers);
  const waste = parseWasteItems(value.waste);
  const localRules = parseLocalRules(value.localRules);
  const usefulLinks = parseUsefulLinks(value.usefulLinks);
  const documents = parseDocuments(value.documents);
  const updatedAt = parseOptionalString(value.updatedAt);

  if (
    !title &&
    !intro &&
    !emergencyNumbers &&
    !waste &&
    !localRules &&
    !usefulLinks &&
    !documents &&
    !updatedAt
  ) {
    return undefined;
  }

  return {
    title,
    intro,
    emergencyNumbers,
    waste,
    localRules,
    usefulLinks,
    documents,
    updatedAt,
  };
}

function parseCultureLoisirs(value: unknown): CultureLoisirsProfile | undefined {
  if (!isRecord(value)) return undefined;
  const sports = parseSports(value.sports);
  if (!sports) return undefined;
  return { sports };
}

function parseVieQuotidienne(value: unknown): VieQuotidienneProfile | undefined {
  if (!isRecord(value)) return undefined;
  const infosPratiques = parseInfosPratiques(value.infosPratiques);
  const ecoleEnfance = parseEcoleEnfance(value.ecoleEnfance);
  const restaurationScolaire = parseRestaurationScolaire(value.restaurationScolaire);
  if (!infosPratiques && !ecoleEnfance && !restaurationScolaire) return undefined;
  return { infosPratiques, ecoleEnfance, restaurationScolaire };
}

function parseMunicipalityProfile(raw: unknown): MunicipalityProfile | undefined {
  if (!isRecord(raw)) return undefined;

  const commune = isRecord(raw.commune) ? (raw.commune as Partial<CommuneProfile>) : undefined;
  const contact = isRecord(raw.contact) ? (raw.contact as Partial<ContactProfile>) : undefined;
  const maire = isRecord(raw.maire) ? (raw.maire as Partial<MayorProfile>) : undefined;
  const ecole = isRecord(raw.ecole) ? (raw.ecole as Partial<SchoolProfile>) : undefined;
  const vieQuotidienne = parseVieQuotidienne(raw.vieQuotidienne);
  const cultureLoisirs = parseCultureLoisirs(raw.cultureLoisirs);
  const metadata = isRecord(raw.metadata)
    ? (raw.metadata as MunicipalityProfile['metadata'])
    : undefined;

  let coordinates: CoordinatesProfile | undefined;
  if (isRecord(raw.coordinates)) {
    const lat = typeof raw.coordinates.lat === 'number' ? raw.coordinates.lat : undefined;
    const lng = typeof raw.coordinates.lng === 'number' ? raw.coordinates.lng : undefined;
    if (lat !== undefined && lng !== undefined) {
      coordinates = { lat, lng };
    }
  }

  const horaires = parseHoraires(raw.horaires);

  if (
    !commune &&
    !contact &&
    !coordinates &&
    !horaires &&
    !maire &&
    !ecole &&
    !vieQuotidienne &&
    !cultureLoisirs &&
    !metadata
  ) {
    return undefined;
  }

  return {
    commune,
    contact,
    coordinates,
    horaires,
    maire,
    ecole,
    vieQuotidienne,
    cultureLoisirs,
    metadata,
  };
}

export async function getPublicSettings(): Promise<PublicSettings | null> {
  if (cachedSettings) {
    return cachedSettings;
  }

  try {
    const settings = await api.settings.getPublic();
    const municipalityProfile = parseMunicipalityProfile(settings.municipalityProfile);
    const branding = isRecord(settings.branding) ? settings.branding : {};
    const accessibility = isRecord(settings.accessibility) ? settings.accessibility : {};
    const address = parseAddress(settings.address);

    const contactEmail =
      typeof settings.contactEmail === 'string' && settings.contactEmail
        ? settings.contactEmail
        : municipalityProfile?.contact?.email;

    const contactPhone =
      typeof settings.contactPhone === 'string' && settings.contactPhone
        ? settings.contactPhone
        : municipalityProfile?.contact?.telephone;

    const resolvedSettings: PublicSettings = {
      siteName:
        typeof settings.siteName === 'string' && settings.siteName
          ? settings.siteName
          : 'Mairie',
      branding: {
        logo: typeof branding.logo === 'string' ? branding.logo : undefined,
        primaryColor:
          typeof branding.primaryColor === 'string' ? branding.primaryColor : undefined,
        secondaryColor:
          typeof branding.secondaryColor === 'string' ? branding.secondaryColor : undefined,
      },
      accessibility: {
        seniorMode:
          typeof accessibility.seniorMode === 'boolean'
            ? accessibility.seniorMode
            : undefined,
        dyslexicMode:
          typeof accessibility.dyslexicMode === 'boolean'
            ? accessibility.dyslexicMode
            : undefined,
        nightMode:
          typeof accessibility.nightMode === 'boolean'
            ? accessibility.nightMode
            : undefined,
      },
      contactEmail,
      contactPhone,
      address,
      municipalityProfile,
    };

    cachedSettings = resolvedSettings;
    return cachedSettings;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres publics:', error);
    cachedSettings = null;
    return null;
  }
}

export function clearSettingsCache() {
  cachedSettings = null;
}
