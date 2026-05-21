const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const NON_REFRESHABLE_ENDPOINTS = new Set([
  '/auth/login',
  '/auth/mfa/verify',
  '/auth/refresh',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
]);

let accessTokenMemory: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

export type PreviewDraftCreateInput =
  | {
      type: 'article';
      sourceId?: string | null;
      data: {
        title: string;
        slug?: string | null;
        summary?: string | null;
        content?: string | null;
        status?: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
        publishedAt?: string | null;
        createdAt?: string | null;
        updatedAt?: string | null;
        coverMediaId?: string | null;
        type?: 'ACTUALITE' | 'PUBLICATION' | 'BREVE';
        publicationType?: 'ARRETE' | 'COMPTE_RENDU' | 'DELIBERATION' | null;
        documentMediaId?: string | null;
        documentNumber?: string | null;
        meetingDate?: string | null;
        publicationYear?: number | null;
        isFlash?: boolean;
      };
    }
  | {
      type: 'event';
      sourceId?: string | null;
      data: {
        title: string;
        slug?: string | null;
        summary?: string | null;
        content?: string | null;
        status?: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
        publishedAt?: string | null;
        createdAt?: string | null;
        updatedAt?: string | null;
        coverMediaId?: string | null;
        locationName?: string | null;
        address?: string | null;
        startsAt?: string | null;
        endsAt?: string | null;
      };
    };

export type PreviewDraftCreateResponse = {
  draftToken: string;
  expiresAt: string;
  previewUrlPath: string;
};

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

function shouldAttemptRefresh(endpoint: string) {
  return !NON_REFRESHABLE_ENDPOINTS.has(endpoint);
}

export function setAccessToken(accessToken: string | null) {
  accessTokenMemory = accessToken;
}

export function clearAccessToken() {
  accessTokenMemory = null;
}

export function getAccessToken() {
  return accessTokenMemory;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        clearAccessToken();
        return null;
      }

      const data = await response.json();
      if (!data?.accessToken || typeof data.accessToken !== 'string') {
        clearAccessToken();
        return null;
      }

      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      clearAccessToken();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  try {
    return await refreshInFlight;
  } catch {
    clearAccessToken();
    return null;
  }
}

export async function getValidAccessToken() {
  const currentToken = getAccessToken();
  if (currentToken) return currentToken;
  return refreshAccessToken();
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const token = await getValidAccessToken();
  const headers = new Headers(init.headers ?? {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });
}

export async function api<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  let accessToken = getAccessToken();

  const makeRequest = async (token: string | null) => {
    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    if (body !== undefined && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    return response;
  };

  let response = await makeRequest(accessToken);

  if (response.status === 401 && shouldAttemptRefresh(endpoint)) {
    accessToken = await refreshAccessToken();
    if (accessToken) {
      response = await makeRequest(accessToken);
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(response.status, response.statusText, data);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const auth = {
  login: (email: string, password: string, mfaCode?: string) =>
    api<{ accessToken?: string; requireMfa?: boolean; mfaToken?: string }>(
      '/auth/login',
      { method: 'POST', body: { email, password, mfaCode } },
    ),

  verifyMfa: (mfaToken: string, code: string) =>
    api<{ accessToken: string }>(
      '/auth/mfa/verify',
      { method: 'POST', body: { mfaToken, code } },
    ),

  enableMfa: () =>
    api<{ secret: string; otpauthUrl: string; qrCodeDataUrl: string }>(
      '/auth/mfa/enable',
      { method: 'POST' },
    ),

  confirmMfa: (code: string) =>
    api<{ enabled: boolean }>('/auth/mfa/confirm', { method: 'POST', body: { code } }),

  disableMfa: (code: string) =>
    api<{ disabled: boolean }>('/auth/mfa/disable', { method: 'POST', body: { code } }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api<{ success: boolean }>('/auth/change-password', {
      method: 'PATCH',
      body: { currentPassword, newPassword },
    }),

  forgotPassword: (email: string) =>
    api('/auth/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (token: string, password: string) =>
    api('/auth/reset-password', { method: 'POST', body: { token, password } }),

  me: () => api<User>('/auth/me'),

  restoreSession: () => refreshAccessToken(),

  logout: async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
    } finally {
      clearAccessToken();
    }
  },
};

export const previewDrafts = {
  create: (data: PreviewDraftCreateInput) =>
    api<PreviewDraftCreateResponse>('/preview-drafts', { method: 'POST', body: data }),
};


export const articles = {
  list: (params?: { status?: string; search?: string; type?: ArticleType; publicationType?: PublicationType; isFlash?: boolean }) =>
    api<Article[]>(`/articles/admin?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<Article>(`/articles/admin/${id}`),
  create: (data: Partial<Article>) => api<Article>('/articles', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Article>) => api<Article>(`/articles/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/articles/${id}`, { method: 'DELETE' }),
  publish: (id: string) => api<Article>(`/articles/${id}/publish`, { method: 'POST' }),
  schedule: (id: string, scheduledAt: string) =>
    api<Article>(`/articles/${id}/schedule`, { method: 'POST', body: { scheduledAt } }),
  archive: (id: string) => api<Article>(`/articles/${id}/archive`, { method: 'POST' }),
};

export const events = {
  list: (params?: { status?: string; search?: string }) =>
    api<Event[]>(`/events/admin?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<Event>(`/events/admin/${id}`),
  create: (data: Partial<Event>) => api<Event>('/events', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Event>) => api<Event>(`/events/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/events/${id}`, { method: 'DELETE' }),
  publish: (id: string) => api<Event>(`/events/${id}/publish`, { method: 'POST' }),
  schedule: (id: string, scheduledAt: string) =>
    api<Event>(`/events/${id}/schedule`, { method: 'POST', body: { scheduledAt } }),
  archive: (id: string) => api<Event>(`/events/${id}/archive`, { method: 'POST' }),
};

export const media = {
  list: (params?: { type?: string; search?: string }) =>
    api<Media[]>(`/media?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<Media>(`/media/${id}`),
  presign: (data: { filename: string; mimeType: string; size: number }) =>
    api<{ storageKey: string; uploadUrl: string; bucket: string }>('/media/presign', { method: 'POST', body: data }),
  confirm: (data: {
    storageKey: string;
    filename: string;
    mimeType: string;
    size: number;
    title?: string | null;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
  }) => api<Media>('/media/confirm', { method: 'POST', body: data }),
  download: (id: string) => api<{ url: string }>(`/media/${id}/download`),
  delete: (id: string) => api(`/media/${id}`, { method: 'DELETE' }),
};

export const settings = {
  get: () => api<Settings>('/settings'),
  update: (data: Partial<Settings>) => api<Settings>('/settings', { method: 'PATCH', body: data }),
};

export const audit = {
  list: (params?: { userId?: string; action?: string; entity?: string }) =>
    api<AuditLog[]>(`/audit?${new URLSearchParams(params as Record<string, string>).toString()}`),
};

export const versions = {
  list: (entityType: string, entityId: string) =>
    api<Version[]>(`/versions/${entityType}/${entityId}`),
  restore: (versionId: string) =>
    api(`/versions/${versionId}/restore`, { method: 'POST' }),
};

export const users = {
  list: () => api<User[]>('/users'),
  get: (id: string) => api<User>(`/users/${id}`),
  create: (data: Partial<User>) => api<User>('/users', { method: 'POST', body: data }),
  update: (id: string, data: Partial<User>) => api<User>(`/users/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/users/${id}`, { method: 'DELETE' }),
};


export const annuaire = {
  list: (params?: { status?: string; type?: string; search?: string }) =>
    api<DirectoryEntry[]>(`/annuaire/admin?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<DirectoryEntry>(`/annuaire/${id}`),
  create: (data: Partial<DirectoryEntry>) => api<DirectoryEntry>('/annuaire', { method: 'POST', body: data }),
  update: (id: string, data: Partial<DirectoryEntry>) => api<DirectoryEntry>(`/annuaire/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/annuaire/${id}`, { method: 'DELETE' }),
  publish: (id: string) => api<DirectoryEntry>(`/annuaire/${id}/publish`, { method: 'POST' }),
  schedule: (id: string, scheduledAt: string) =>
    api<DirectoryEntry>(`/annuaire/${id}/schedule`, { method: 'POST', body: { scheduledAt } }),
  archive: (id: string) => api<DirectoryEntry>(`/annuaire/${id}/archive`, { method: 'POST' }),
};


export const procedures = {
  list: (params?: { status?: string }) =>
    api<Procedure[]>(`/demarches/admin?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<Procedure>(`/demarches/admin/${id}`),
  create: (data: Partial<Procedure>) => api<Procedure>('/demarches', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Procedure>) => api<Procedure>(`/demarches/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/demarches/${id}`, { method: 'DELETE' }),
  publish: (id: string) => api<Procedure>(`/demarches/${id}/publish`, { method: 'POST' }),
  schedule: (id: string, scheduledAt: string) =>
    api<Procedure>(`/demarches/${id}/schedule`, { method: 'POST', body: { scheduledAt } }),
  archive: (id: string) => api<Procedure>(`/demarches/${id}/archive`, { method: 'POST' }),
};

export const council = {
  list: (params?: { status?: string; role?: CouncilMemberRole }) =>
    api<CouncilMember[]>(`/council/admin?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<CouncilMember>(`/council/admin/${id}`),
  create: (data: Partial<CouncilMember>) => api<CouncilMember>('/council', { method: 'POST', body: data }),
  update: (id: string, data: Partial<CouncilMember>) => api<CouncilMember>(`/council/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/council/${id}`, { method: 'DELETE' }),
  publish: (id: string) => api<CouncilMember>(`/council/${id}/publish`, { method: 'POST' }),
  schedule: (id: string, scheduledAt: string) =>
    api<CouncilMember>(`/council/${id}/schedule`, { method: 'POST', body: { scheduledAt } }),
  archive: (id: string) => api<CouncilMember>(`/council/${id}/archive`, { method: 'POST' }),
};

export const municipalServices = {
  list: (params?: { status?: string; category?: string }) =>
    api<MunicipalService[]>(
      `/municipal-services/admin?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),
  get: (id: string) => api<MunicipalService>(`/municipal-services/admin/${id}`),
  create: (data: Partial<MunicipalService>) =>
    api<MunicipalService>('/municipal-services', { method: 'POST', body: data }),
  update: (id: string, data: Partial<MunicipalService>) =>
    api<MunicipalService>(`/municipal-services/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/municipal-services/${id}`, { method: 'DELETE' }),
  publish: (id: string) =>
    api<MunicipalService>(`/municipal-services/${id}/publish`, { method: 'POST' }),
  schedule: (id: string, scheduledAt: string) =>
    api<MunicipalService>(`/municipal-services/${id}/schedule`, { method: 'POST', body: { scheduledAt } }),
  archive: (id: string) =>
    api<MunicipalService>(`/municipal-services/${id}/archive`, { method: 'POST' }),
};

export type NewsletterTopic = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NewsletterSubscription = {
  id: string;
  email: string;
  confirmedAt?: string | null;
  unsubscribedAt?: string | null;
  createdAt: string;
  topics: { topic: NewsletterTopic }[];
};

export type NewsletterStats = {
  total: number;
  confirmed: number;
  unconfirmed: number;
  unsubscribed: number;
  byTopic: { topicId: string; topicName: string; count: number }[];
};

export const newsletters = {
  subscriptions: (params?: { status?: string }) =>
    api<NewsletterSubscription[]>(`/newsletters/subscriptions?${new URLSearchParams(params as Record<string, string>).toString()}`),
  stats: () => api<NewsletterStats>('/newsletters/stats'),
  topics: (params?: { admin?: boolean }) =>
    api<NewsletterTopic[]>(params?.admin ? '/newsletters/topics/admin' : '/newsletters/topics'),
  createTopic: (data: { name: string; slug: string; description?: string }) =>
    api<NewsletterTopic>('/newsletters/topics', { method: 'POST', body: data }),
  updateTopic: (id: string, data: Partial<NewsletterTopic>) =>
    api<NewsletterTopic>(`/newsletters/topics/${id}`, { method: 'PATCH', body: data }),
  deleteTopic: (id: string) =>
    api(`/newsletters/topics/${id}`, { method: 'DELETE' }),
  exportCsv: () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return authenticatedFetch(`${apiUrl}/newsletters/export/csv`).then((r) => r.blob());
  },
};

export const transports = {
  list: (params?: { status?: string }) =>
    api<TransportInfo[]>(`/transports/admin?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<TransportInfo>(`/transports/admin/${id}`),
  create: (data: Partial<TransportInfo>) => api<TransportInfo>('/transports', { method: 'POST', body: data }),
  update: (id: string, data: Partial<TransportInfo>) => api<TransportInfo>(`/transports/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/transports/${id}`, { method: 'DELETE' }),
  publish: (id: string) => api<TransportInfo>(`/transports/${id}/publish`, { method: 'POST' }),
  schedule: (id: string, scheduledAt: string) =>
    api<TransportInfo>(`/transports/${id}/schedule`, { method: 'POST', body: { scheduledAt } }),
  archive: (id: string) => api<TransportInfo>(`/transports/${id}/archive`, { method: 'POST' }),
};

// Types
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN_MAIRIE' | 'AGENT' | 'CONTRIBUTOR' | 'READER';
  mfaEnabled: boolean;
  isActive: boolean;
  password?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export type Page = {
  id: string;
  title: string;
  slug: string;
  content: unknown;
  blocks?: unknown | null;
  summary?: string | null;
  status: ContentStatus;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  menuTitle?: string | null;
  showInMenu?: boolean;
  menuOrder?: number;
  parentId?: string | null;
  template?: string | null;
  coverMediaId?: string | null;
  coverMedia?: Media | null;
  author?: User;
  createdById?: string;
  updatedById?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
};

export type ArticleType = 'ACTUALITE' | 'PUBLICATION' | 'BREVE';
export type PublicationType = 'ARRETE' | 'COMPTE_RENDU' | 'DELIBERATION';

export type Article = Page & {
  type: ArticleType;
  publicationType?: PublicationType | null;
  documentMediaId?: string | null;
  documentMedia?: Media | null;
  documentNumber?: string | null;
  meetingDate?: string | null;
  publicationYear?: number | null;
  isFlash: boolean;
};
export type Event = Page & {
  startsAt: string;
  endsAt?: string;
  locationName?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type CouncilMemberRole = 'MAIRE' | 'ADJOINT' | 'CONSEILLER' | 'CONSEILLER_DELEGUE';

export type CouncilMember = {
  id: string;
  name: string;
  role: CouncilMemberRole;
  roleTitle?: string | null;
  delegations?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  order?: number;
  status: ContentStatus;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  photoMediaId?: string | null;
  photoMedia?: Media | null;
  createdAt: string;
  updatedAt: string;
};

export type MunicipalService = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  openingHours?: unknown | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  order?: number;
  status: ContentStatus;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  coverMediaId?: string | null;
  coverMedia?: Media | null;
  createdAt: string;
  updatedAt: string;
};

export type TransportInfo = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content: unknown;
  operator?: string | null;
  website?: string | null;
  phone?: string | null;
  status: ContentStatus;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  coverMediaId?: string | null;
  coverMedia?: Media | null;
  createdAt: string;
  updatedAt: string;
};

export type Media = {
  id: string;
  filename: string;
  storageKey: string;
  mimeType: string;
  size: number;
  alt?: string;
  url: string;
  createdAt: string;
};

export type InfosPratiquesEmergencyNumber = {
  label: string;
  value: string;
  description?: string;
  priority?: number;
};

export type InfosPratiquesWasteItem = {
  title: string;
  description?: string;
  schedule?: string;
  location?: string;
  linkLabel?: string;
  linkUrl?: string;
  priority?: number;
};

export type InfosPratiquesLocalRule = {
  title: string;
  description: string;
  priority?: number;
};

export type InfosPratiquesUsefulLink = {
  label: string;
  url: string;
  description?: string;
  priority?: number;
};

export type InfosPratiquesDocument = {
  title: string;
  description?: string;
  mediaId?: string;
  url?: string;
  priority?: number;
};

export type InfosPratiquesContent = {
  title?: string;
  intro?: string;
  emergencyNumbers?: InfosPratiquesEmergencyNumber[];
  waste?: InfosPratiquesWasteItem[];
  localRules?: InfosPratiquesLocalRule[];
  usefulLinks?: InfosPratiquesUsefulLink[];
  documents?: InfosPratiquesDocument[];
  updatedAt?: string;
};

export type EcoleEnfanceLink = {
  label: string;
  url: string;
};

export type EcoleEnfanceDocument = {
  title: string;
  description?: string;
  mediaId?: string;
  url?: string;
};

export type EcoleEnfanceSection = {
  key: string;
  title: string;
  description?: string;
  content?: string;
  links?: EcoleEnfanceLink[];
  documents?: EcoleEnfanceDocument[];
  priority?: number;
};

export type EcoleEnfanceSchoolContact = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  director?: string;
};

export type EcoleEnfanceContent = {
  title?: string;
  intro?: string;
  schoolContact?: EcoleEnfanceSchoolContact;
  sections?: EcoleEnfanceSection[];
  updatedAt?: string;
};

export type RestaurationScolaireMenuFormat = 'TEXT' | 'IMAGE' | 'PDF' | 'MIXED';

export type RestaurationScolaireMenu = {
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
};

export type RestaurationScolaireDocument = {
  title: string;
  description?: string;
  mediaId?: string;
  url?: string;
};

export type RestaurationScolaireContent = {
  title?: string;
  intro?: string;
  menuCourant?: RestaurationScolaireMenu;
  tarifs?: string;
  inscription?: string;
  allergies?: string;
  engagements?: string;
  documents?: RestaurationScolaireDocument[];
  updatedAt?: string;
};

export type SportsHighlight = {
  title: string;
  description?: string;
  priority?: number;
};

export type SportsUsefulLink = {
  label: string;
  url: string;
  description?: string;
  priority?: number;
};

export type SportsDocument = {
  title: string;
  description?: string;
  mediaId?: string;
  url?: string;
  priority?: number;
};

export type SportsContent = {
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
};

export type CultureLoisirsProfile = {
  sports?: SportsContent | null;
  [key: string]: unknown;
};

export type MunicipalityProfile = {
  commune?: Record<string, unknown> | null;
  contact?: Record<string, unknown> | null;
  coordinates?: Record<string, unknown> | null;
  horaires?: Record<string, unknown> | null;
  maire?: Record<string, unknown> | null;
  ecole?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  vieQuotidienne?: {
    infosPratiques?: InfosPratiquesContent | null;
    ecoleEnfance?: EcoleEnfanceContent | null;
    restaurationScolaire?: RestaurationScolaireContent | null;
    [key: string]: unknown;
  } | null;
  cultureLoisirs?: CultureLoisirsProfile | null;
  [key: string]: unknown;
};

export type Settings = {
  id: string;
  siteName: string;
  branding?: unknown;
  accessibility?: unknown;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: unknown | null;
  municipalityProfile?: MunicipalityProfile | null;
};

export type AuditLog = {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entityType?: string;
  entityId?: string | null;
  entityTitle?: string;
  changes?: unknown;
  ip?: string;
  createdAt: string;
};

export type Version = {
  id: string;
  entityType: string;
  entityId: string;
  snapshot: unknown;
  userId: string;
  user?: User;
  createdAt: string;
};


export type DirectoryEntry = {
  id: string;
  name: string;
  type: 'ASSOCIATION' | 'ENTERPRISE' | 'COMMERCE';
  description?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: Record<string, string>;
  coverMediaId?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
};


export type Procedure = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content: unknown;
  steps?: unknown;
  externalUrl?: string | null;
  status: ContentStatus;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  coverMediaId?: string | null;
  coverMedia?: Media | null;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
};
