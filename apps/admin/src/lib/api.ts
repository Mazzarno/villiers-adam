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
    api<Page[]>(`/pages?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<Page>(`/pages/${id}`),
  create: (data: Partial<Page>) => api<Page>('/pages', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Page>) => api<Page>(`/pages/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/pages/${id}`, { method: 'DELETE' }),
  publish: (id: string) => api<Page>(`/pages/${id}/publish`, { method: 'POST' }),
  schedule: (id: string, publishAt: string) => api<Page>(`/pages/${id}/schedule`, { method: 'POST', body: { publishAt } }),
  archive: (id: string) => api<Page>(`/pages/${id}/archive`, { method: 'POST' }),
};

export const articles = {
  list: (params?: { status?: string; search?: string }) =>
    api<Article[]>(`/articles?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<Article>(`/articles/${id}`),
  create: (data: Partial<Article>) => api<Article>('/articles', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Article>) => api<Article>(`/articles/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/articles/${id}`, { method: 'DELETE' }),
  publish: (id: string) => api<Article>(`/articles/${id}/publish`, { method: 'POST' }),
  schedule: (id: string, publishAt: string) => api<Article>(`/articles/${id}/schedule`, { method: 'POST', body: { publishAt } }),
  archive: (id: string) => api<Article>(`/articles/${id}/archive`, { method: 'POST' }),
};

export const events = {
  list: (params?: { status?: string; search?: string }) =>
    api<Event[]>(`/events?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<Event>(`/events/${id}`),
  create: (data: Partial<Event>) => api<Event>('/events', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Event>) => api<Event>(`/events/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/events/${id}`, { method: 'DELETE' }),
  publish: (id: string) => api<Event>(`/events/${id}/publish`, { method: 'POST' }),
};

export const media = {
  list: (params?: { type?: string; search?: string }) =>
    api<Media[]>(`/media?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<Media>(`/media/${id}`),
  getUploadUrl: (filename: string, contentType: string) =>
    api<{ uploadUrl: string; key: string }>('/media/upload-url', { method: 'POST', body: { filename, contentType } }),
  create: (data: { filename: string; storageKey: string; mimeType: string; size: number; alt?: string }) =>
    api<Media>('/media', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Media>) => api<Media>(`/media/${id}`, { method: 'PATCH', body: data }),
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
  list: (params?: { type?: string }) =>
    api<AgendaItem[]>(`/agenda?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<AgendaItem>(`/agenda/${id}`),
  create: (data: Partial<AgendaItem>) => api<AgendaItem>('/agenda', { method: 'POST', body: data }),
  update: (id: string, data: Partial<AgendaItem>) => api<AgendaItem>(`/agenda/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/agenda/${id}`, { method: 'DELETE' }),
};

export const annuaire = {
  list: (params?: { type?: string }) =>
    api<DirectoryEntry[]>(`/annuaire?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<DirectoryEntry>(`/annuaire/${id}`),
  create: (data: Partial<DirectoryEntry>) => api<DirectoryEntry>('/annuaire', { method: 'POST', body: data }),
  update: (id: string, data: Partial<DirectoryEntry>) => api<DirectoryEntry>(`/annuaire/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => api(`/annuaire/${id}`, { method: 'DELETE' }),
};

export const reservations = {
  list: (params?: { status?: string }) =>
    api<Reservation[]>(`/reservations?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<Reservation>(`/reservations/${id}`),
  updateStatus: (id: string, status: string) =>
    api<Reservation>(`/reservations/${id}/status`, { method: 'PATCH', body: { status } }),
};

export const forms = {
  list: (params?: { status?: string; type?: string }) =>
    api<FormSubmission[]>(`/forms?${new URLSearchParams(params as Record<string, string>).toString()}`),
  get: (id: string) => api<FormSubmission>(`/forms/${id}`),
  updateStatus: (id: string, status: string) =>
    api<FormSubmission>(`/forms/${id}/status`, { method: 'PATCH', body: { status } }),
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
  excerpt?: string;
  status: ContentStatus;
  publishedAt?: string;
  authorId: string;
  author?: User;
  featuredImageId?: string;
  featuredImage?: Media;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
};

export type Article = Page;
export type Event = Page & {
  startsAt: string;
  endsAt?: string;
  location?: string;
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
  siteDescription?: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  fontHeading: string;
  fontBody: string;
  seniorModeEnabled: boolean;
  dyslexicModeEnabled: boolean;
  darkModeEnabled: boolean;
  address?: string;
  phone?: string;
  email?: string;
  openingHours?: Record<string, string>;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
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
  createdAt: string;
};

export type DirectoryEntry = {
  id: string;
  name: string;
  type: 'ASSOCIATION' | 'ENTERPRISE' | 'COMMERCE';
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: Record<string, string>;
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
