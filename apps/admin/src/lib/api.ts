const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
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

async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function api<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  let accessToken = await getAccessToken();

  const makeRequest = async (token: string | null) => {
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    return response;
  };

  let response = await makeRequest(accessToken);

  if (response.status === 401 && accessToken) {
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
    api<{ accessToken?: string; refreshToken?: string; requireMfa?: boolean; mfaToken?: string }>(
      '/auth/login',
      { method: 'POST', body: { email, password, mfaCode } },
    ),

  verifyMfa: (mfaToken: string, code: string) =>
    api<{ accessToken: string; refreshToken: string }>(
      '/auth/mfa/verify',
      { method: 'POST', body: { mfaToken, code } },
    ),

  enableMfa: () =>
    api<{ secret: string; qrCode: string }>('/auth/mfa/enable', { method: 'POST' }),

  disableMfa: (code: string) =>
    api('/auth/mfa/disable', { method: 'POST', body: { code } }),

  forgotPassword: (email: string) =>
    api('/auth/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (token: string, password: string) =>
    api('/auth/reset-password', { method: 'POST', body: { token, password } }),

  me: () => api<User>('/auth/me'),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

export const pages = {
  list: (params?: { status?: string; search?: string }) =>
    api<Page[]>(`/pages/admin?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<Page>(`/pages/admin/${id}`),
  create: (data: Partial<Page>) => api<Page>('/pages', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Page>) => api<Page>(`/pages/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/pages/${id}`, { method: 'DELETE' }),
  publish: (id: string) => api<Page>(`/pages/${id}/publish`, { method: 'POST' }),
  schedule: (id: string, scheduledAt: string) =>
    api<Page>(`/pages/${id}/schedule`, { method: 'POST', body: { scheduledAt } }),
  archive: (id: string) => api<Page>(`/pages/${id}/archive`, { method: 'POST' }),
};

export const articles = {
  list: (params?: { status?: string; search?: string; type?: ArticleType; publicationType?: PublicationType }) =>
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
  list: (params?: { userId?: string; action?: string; entityType?: string }) =>
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

export const agenda = {
  list: (params?: { status?: string; search?: string }) =>
    api<AgendaItem[]>(`/agenda/admin?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<AgendaItem>(`/agenda/${id}`),
  create: (data: Partial<AgendaItem>) => api<AgendaItem>('/agenda', { method: 'POST', body: data }),
  update: (id: string, data: Partial<AgendaItem>) => api<AgendaItem>(`/agenda/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/agenda/${id}`, { method: 'DELETE' }),
  publish: (id: string) => api<AgendaItem>(`/agenda/${id}/publish`, { method: 'POST' }),
  schedule: (id: string, scheduledAt: string) =>
    api<AgendaItem>(`/agenda/${id}/schedule`, { method: 'POST', body: { scheduledAt } }),
  archive: (id: string) => api<AgendaItem>(`/agenda/${id}/archive`, { method: 'POST' }),
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

export const reservations = {
  list: (params?: { status?: string }) =>
    api<Reservation[]>(`/reservations?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<Reservation>(`/reservations/${id}`),
  updateStatus: (id: string, status: string) =>
    api<Reservation>(`/reservations/${id}/status`, { method: 'PATCH', body: { status } }),
};

export const rooms = {
  list: () => api<Room[]>('/rooms/admin/all'),
  get: (id: string) => api<Room>(`/rooms/admin/${id}`),
  create: (data: Partial<Room>) => api<Room>('/rooms/admin', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Room>) => api<Room>(`/rooms/admin/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api(`/rooms/admin/${id}`, { method: 'DELETE' }),
};

export const forms = {
  list: (params?: { status?: string; type?: string }) =>
    api<FormSubmission[]>(`/forms?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<FormSubmission>(`/forms/${id}`),
  updateStatus: (id: string, status: string) =>
    api<FormSubmission>(`/forms/${id}/status`, { method: 'PATCH', body: { status } }),
};

export const procedures = {
  list: (params?: { status?: string }) =>
    api<Procedure[]>(`/procedures?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<Procedure>(`/procedures/${id}`),
  create: (data: Partial<Procedure>) => api<Procedure>('/procedures', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Procedure>) => api<Procedure>(`/procedures/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/procedures/${id}`, { method: 'DELETE' }),
  publish: (id: string) => api<Procedure>(`/procedures/${id}/publish`, { method: 'POST' }),
  schedule: (id: string, scheduledAt: string) =>
    api<Procedure>(`/procedures/${id}/schedule`, { method: 'POST', body: { scheduledAt } }),
  archive: (id: string) => api<Procedure>(`/procedures/${id}/archive`, { method: 'POST' }),
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
  role: 'SUPER_ADMIN' | 'ADMIN_MAIRIE' | 'AGENT' | 'CONTRIBUTOR' | 'READER';
  mfaEnabled: boolean;
  isActive: boolean;
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

export type Settings = {
  id: string;
  siteName: string;
  branding?: unknown;
  accessibility?: unknown;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: unknown | null;
};

export type AuditLog = {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entityType: string;
  entityId: string;
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

export type AgendaItem = {
  id: string;
  title: string;
  description?: string;
  type: 'COMMUNAL' | 'ASSOCIATIF' | 'DECHETS';
  startsAt: string;
  endsAt?: string;
  location?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  scheduledAt?: string;
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

export type Reservation = {
  id: string;
  roomId: string;
  room?: { id: string; name: string };
  startsAt: string;
  endsAt: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
};

export type Room = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    reservations: number;
  };
};

export type FormSubmission = {
  id: string;
  type: 'CONTACT' | 'SIGNALEMENT' | 'AUTRE';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  subject?: string;
  message: string;
  name?: string;
  email?: string;
  phone?: string;
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
