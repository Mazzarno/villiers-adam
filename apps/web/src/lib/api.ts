const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

type ApiContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

type ApiMedia = {
  id?: string;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  storageKey?: string | null;
};

type ApiPage = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content?: unknown;
  blocks?: unknown | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  menuTitle?: string | null;
  showInMenu?: boolean | null;
  menuOrder?: number | null;
  parentId?: string | null;
  template?: string | null;
  status: ApiContentStatus;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  coverMedia?: ApiMedia | null;
};

type ApiArticle = ApiPage & {
  isFlash?: boolean;
  type?: 'ACTUALITE' | 'PUBLICATION' | 'BREVE';
  publicationType?: 'ARRETE' | 'COMPTE_RENDU' | 'DELIBERATION' | null;
  documentMedia?: ApiMedia | null;
  documentNumber?: string | null;
  meetingDate?: string | null;
  publicationYear?: number | null;
};

type ApiEvent = ApiPage & {
  startsAt: string;
  endsAt?: string | null;
  locationName?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type ApiDirectoryEntry = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  type?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  openingHours?: unknown | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  coverMedia?: ApiMedia | null;
};

type ApiRoom = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  location?: string | null;
  capacity?: number | null;
  isActive: boolean;
};

type ApiCouncilMember = {
  id: string;
  name: string;
  role: 'MAIRE' | 'ADJOINT' | 'CONSEILLER' | 'CONSEILLER_DELEGUE';
  roleTitle?: string | null;
  delegations?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  order?: number | null;
  photoMedia?: ApiMedia | null;
};

type ApiMunicipalService = {
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
  order?: number | null;
  coverMedia?: ApiMedia | null;
};

type ApiTransportInfo = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content?: unknown;
  operator?: string | null;
  website?: string | null;
  phone?: string | null;
  coverMedia?: ApiMedia | null;
};

type ApiProcedure = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content?: unknown;
  steps?: unknown | null;
  externalUrl?: string | null;
  coverMedia?: ApiMedia | null;
};

const mapContentStatus = (status?: ApiContentStatus) => {
  switch (status) {
    case 'PUBLISHED':
      return 'published';
    case 'ARCHIVED':
      return 'archived';
    case 'SCHEDULED':
    case 'DRAFT':
    default:
      return 'draft';
  }
};

const mapEventStatus = (status?: ApiContentStatus) => {
  switch (status) {
    case 'ARCHIVED':
      return 'cancelled';
    case 'PUBLISHED':
      return 'published';
    case 'SCHEDULED':
    case 'DRAFT':
    default:
      return 'draft';
  }
};

const normalizeContent = (value?: unknown) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
};

const normalizeBlocks = (value?: unknown) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const resolveMediaUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
};

const formatDirectoryAddress = (entry: ApiDirectoryEntry) => {
  const parts: string[] = [];
  if (entry.addressLine1) parts.push(entry.addressLine1);
  if (entry.addressLine2) parts.push(entry.addressLine2);
  const cityLine = [entry.postalCode, entry.city].filter(Boolean).join(' ');
  if (cityLine) parts.push(cityLine);
  if (entry.country) parts.push(entry.country);
  return parts.length > 0 ? parts.join(', ') : undefined;
};

const mapPage = (page: ApiPage): Page => ({
  id: page.id,
  title: page.title,
  slug: page.slug,
  content: normalizeContent(page.content),
  blocks: normalizeBlocks(page.blocks),
  menuTitle: page.menuTitle ?? undefined,
  showInMenu: page.showInMenu ?? undefined,
  menuOrder: page.menuOrder ?? undefined,
  parentId: page.parentId ?? undefined,
  template: page.template ?? undefined,
  metaTitle: page.metaTitle ?? undefined,
  metaDescription: page.metaDescription ?? undefined,
  excerpt: page.summary ?? undefined,
  featuredImage: resolveMediaUrl(page.coverMedia?.url),
  status: mapContentStatus(page.status),
  publishedAt: page.publishedAt ?? undefined,
  createdAt: page.createdAt ?? page.publishedAt ?? new Date().toISOString(),
  updatedAt: page.updatedAt ?? page.publishedAt ?? new Date().toISOString(),
});

const mapArticle = (article: ApiArticle): Article => ({
  id: article.id,
  title: article.title,
  slug: article.slug,
  content: normalizeContent(article.content),
  excerpt: article.summary ?? undefined,
  featuredImage: resolveMediaUrl(article.coverMedia?.url),
  type: article.type ?? 'ACTUALITE',
  publicationType: article.publicationType ?? undefined,
  documentUrl: resolveMediaUrl(article.documentMedia?.url ?? undefined),
  documentNumber: article.documentNumber ?? undefined,
  meetingDate: article.meetingDate ?? undefined,
  publicationYear: article.publicationYear ?? undefined,
  isFlash: article.isFlash ?? false,
  status: mapContentStatus(article.status),
  publishedAt: article.publishedAt ?? undefined,
  createdAt: article.createdAt ?? article.publishedAt ?? new Date().toISOString(),
  updatedAt: article.updatedAt ?? article.publishedAt ?? new Date().toISOString(),
  tags: [],
});

const mapEvent = (event: ApiEvent): Event => ({
  id: event.id,
  title: event.title,
  slug: event.slug,
  description: event.summary ?? '',
  content: normalizeContent(event.content),
  featuredImage: resolveMediaUrl(event.coverMedia?.url),
  location: event.locationName ?? undefined,
  address: event.address ?? undefined,
  coordinates:
    event.latitude && event.longitude
      ? { lat: event.latitude, lng: event.longitude }
      : undefined,
  startDate: event.startsAt,
  endDate: event.endsAt ?? undefined,
  allDay: false,
  status: mapEventStatus(event.status),
  createdAt: event.createdAt ?? event.publishedAt ?? new Date().toISOString(),
  updatedAt: event.updatedAt ?? event.publishedAt ?? new Date().toISOString(),
});

const mapDirectoryEntry = (entry: ApiDirectoryEntry): DirectoryEntry => ({
  id: entry.id,
  name: entry.name,
  category: entry.type ?? 'AUTRE',
  description: entry.description ?? undefined,
  address: formatDirectoryAddress(entry),
  phone: entry.phone ?? undefined,
  email: entry.email ?? undefined,
  website: entry.website ?? undefined,
  openingHours: entry.openingHours ?? undefined,
  featuredImage: resolveMediaUrl(entry.coverMedia?.url ?? undefined),
  coordinates:
    entry.latitude && entry.longitude
      ? { lat: entry.latitude, lng: entry.longitude }
      : undefined,
});

const mapRoom = (room: ApiRoom): Room => ({
  id: room.id,
  name: room.name,
  slug: room.slug,
  description: room.description ?? undefined,
  location: room.location ?? undefined,
  capacity: room.capacity ?? undefined,
  isActive: room.isActive,
});

const mapCouncilMember = (member: ApiCouncilMember): CouncilMember => ({
  id: member.id,
  name: member.name,
  role: member.role,
  roleTitle: member.roleTitle ?? undefined,
  delegations: member.delegations ?? undefined,
  bio: member.bio ?? undefined,
  email: member.email ?? undefined,
  phone: member.phone ?? undefined,
  order: member.order ?? undefined,
  photo: resolveMediaUrl(member.photoMedia?.url ?? undefined),
});

const mapMunicipalService = (service: ApiMunicipalService): MunicipalService => ({
  id: service.id,
  name: service.name,
  slug: service.slug,
  description: service.description ?? undefined,
  category: service.category ?? undefined,
  openingHours: service.openingHours ?? undefined,
  address: service.address ?? undefined,
  phone: service.phone ?? undefined,
  email: service.email ?? undefined,
  website: service.website ?? undefined,
  order: service.order ?? undefined,
  coverImage: resolveMediaUrl(service.coverMedia?.url ?? undefined),
});

const mapTransportInfo = (info: ApiTransportInfo): TransportInfo => ({
  id: info.id,
  title: info.title,
  slug: info.slug,
  summary: info.summary ?? undefined,
  content: normalizeContent(info.content),
  operator: info.operator ?? undefined,
  website: info.website ?? undefined,
  phone: info.phone ?? undefined,
  coverImage: resolveMediaUrl(info.coverMedia?.url ?? undefined),
});

const mapProcedure = (procedure: ApiProcedure): Procedure => ({
  id: procedure.id,
  title: procedure.title,
  slug: procedure.slug,
  summary: procedure.summary ?? undefined,
  content: normalizeContent(procedure.content),
  steps: procedure.steps ?? undefined,
  externalUrl: procedure.externalUrl ?? undefined,
  coverImage: resolveMediaUrl(procedure.coverMedia?.url ?? undefined),
});

// Types
export type ArticleType = 'ACTUALITE' | 'PUBLICATION' | 'BREVE';
export type PublicationType = 'ARRETE' | 'COMPTE_RENDU' | 'DELIBERATION';

export interface PageBlock {
  id?: string;
  type: 'section' | 'cta' | 'media';
  title?: string;
  body?: string;
  linkLabel?: string;
  linkUrl?: string;
  mediaId?: string;
  mediaUrl?: string;
  mediaAlt?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  blocks?: PageBlock[];
  menuTitle?: string;
  showInMenu?: boolean;
  menuOrder?: number;
  parentId?: string;
  template?: string;
  metaTitle?: string;
  metaDescription?: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageMenuItem {
  id: string;
  slug: string;
  menuTitle?: string | null;
  title: string;
  menuOrder?: number | null;
  parentId?: string | null;
  children: PageMenuItem[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  type: ArticleType;
  publicationType?: PublicationType;
  documentUrl?: string;
  documentNumber?: string;
  meetingDate?: string;
  publicationYear?: number;
  isFlash?: boolean;
  category?: Category;
  categoryId?: string;
  tags?: string[];
  author?: User;
  authorId?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  featuredImage?: string;
  location?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  startDate: string;
  endDate?: string;
  allDay: boolean;
  category?: string;
  status: 'draft' | 'published' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface FlashInfo {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  link?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface DirectoryEntry {
  id: string;
  name: string;
  category: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: unknown;
  featuredImage?: string;
  coordinates?: { lat: number; lng: number };
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  capacity?: number;
  isActive: boolean;
}

export interface CouncilMember {
  id: string;
  name: string;
  role: 'MAIRE' | 'ADJOINT' | 'CONSEILLER' | 'CONSEILLER_DELEGUE';
  roleTitle?: string;
  delegations?: string;
  bio?: string;
  email?: string;
  phone?: string;
  order?: number;
  photo?: string;
}

export interface MunicipalService {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  openingHours?: unknown;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  order?: number;
  coverImage?: string;
}

export interface TransportInfo {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  operator?: string;
  website?: string;
  phone?: string;
  coverImage?: string;
}

export interface Procedure {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  steps?: unknown;
  externalUrl?: string;
  coverImage?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SiteConfig {
  communeName: string;
  communeCode: string;
  department: string;
  region: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  coordinates: { lat: number; lng: number };
  openingHours: {
    day: string;
    morning?: string;
    afternoon?: string;
  }[];
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  logo: string;
  blason: string;
}

// API Client
export const api = {
  // Pages
  pages: {
    list: async () => {
      const data = await fetchAPI<ApiPage[]>('/pages');
      return data.map(mapPage);
    },
    get: async (slug: string) => {
      const data = await fetchAPI<ApiPage>(`/pages/${slug}`);
      return mapPage(data);
    },
    menu: async () => fetchAPI<PageMenuItem[]>('/pages/menu'),
  },

  // Articles
  articles: {
    list: async (params?: { type?: ArticleType; publicationType?: PublicationType; isFlash?: boolean }) => {
      const data = await fetchAPI<ApiArticle[]>('/articles', { params });
      return data.map(mapArticle);
    },
    get: async (slug: string) => {
      const data = await fetchAPI<ApiArticle>(`/articles/${slug}`);
      return mapArticle(data);
    },
    recent: async (limit = 5) => {
      const data = await fetchAPI<ApiArticle[]>('/articles', { params: { type: 'ACTUALITE' } });
      return data.map(mapArticle).slice(0, limit);
    },
  },

  // Categories
  categories: {
    list: () => fetchAPI<Category[]>('/categories'),
  },

  // Events
  events: {
    list: async () => {
      const data = await fetchAPI<ApiEvent[]>('/events');
      return data.map(mapEvent);
    },
    get: async (slug: string) => {
      const data = await fetchAPI<ApiEvent>(`/events/${slug}`);
      return mapEvent(data);
    },
    upcoming: async (limit = 5) => {
      const data = await fetchAPI<ApiEvent[]>('/events');
      const now = new Date();
      return data
        .filter((event) => new Date(event.startsAt) >= now)
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
        .map(mapEvent)
        .slice(0, limit);
    },
  },

  // Flash info
  flashInfo: {
    active: async () => {
      const data = await fetchAPI<ApiArticle[]>('/articles', { params: { isFlash: true } });
      return data.map((article) => ({
        id: article.id,
        message: article.summary ?? article.title,
        type: 'info',
        link: `/actualites/${article.slug}`,
        startDate: article.publishedAt ?? article.createdAt ?? new Date().toISOString(),
        endDate: undefined,
        isActive: true,
      }));
    },
  },

  // Directory
  directory: {
    list: async (params?: { type?: string; search?: string }) => {
      const data = await fetchAPI<ApiDirectoryEntry[]>('/annuaire', { params });
      return data.map(mapDirectoryEntry);
    },
    categories: async () => [],
  },

  // Council
  council: {
    list: async (params?: { role?: string }) => {
      const data = await fetchAPI<ApiCouncilMember[]>('/council', { params });
      return data.map(mapCouncilMember);
    },
  },

  // Rooms
  rooms: {
    list: async () => {
      const data = await fetchAPI<ApiRoom[]>('/rooms');
      return data.map(mapRoom);
    },
    get: async (slug: string) => {
      const data = await fetchAPI<ApiRoom>(`/rooms/${slug}`);
      return mapRoom(data);
    },
  },

  // Municipal services
  municipalServices: {
    list: async (params?: { category?: string }) => {
      const data = await fetchAPI<ApiMunicipalService[]>('/municipal-services', { params });
      return data.map(mapMunicipalService);
    },
  },

  // Transports
  transports: {
    list: async () => {
      const data = await fetchAPI<ApiTransportInfo[]>('/transports');
      return data.map(mapTransportInfo);
    },
  },

  // Demarches
  demarches: {
    list: async () => {
      const data = await fetchAPI<ApiProcedure[]>('/demarches');
      return data.map(mapProcedure);
    },
    get: async (slug: string) => {
      const data = await fetchAPI<ApiProcedure>(`/demarches/${slug}`);
      return mapProcedure(data);
    },
  },

  // Search
  search: {
    global: (query: string, params?: { type?: string; page?: number }) =>
      fetchAPI<{
        articles: Article[];
        pages: Page[];
        events: Event[];
        directory: DirectoryEntry[];
        total: number;
      }>('/search', { params: { q: query, ...params } }),
  },

  // Config
  config: {
    get: () => fetchAPI<SiteConfig>('/config'),
  },

  // Forms
  forms: {
    submit: (data: {
      type: 'CONTACT' | 'SIGNALEMENT';
      subject?: string;
      message: string;
      name?: string;
      email?: string;
      phone?: string;
      data?: Record<string, unknown> | null;
      website?: string;
      captchaToken?: string | null;
    }) =>
      fetchAPI<{ success: boolean; id: string }>('/forms', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Reservations
  reservations: {
    checkAvailability: (data: { roomId: string; startsAt: string; endsAt: string }) =>
      fetchAPI<{ available: boolean; conflictingReservation?: { id: string; startsAt: string; endsAt: string } | null }>(
        '/reservations/check-availability',
        { method: 'POST', body: JSON.stringify(data) }
      ),
    slots: (roomId: string, date: string) =>
      fetchAPI<{ date: string; reservations: { startsAt: string; endsAt: string }[] }>(
        `/reservations/slots/${roomId}`,
        { params: { date } }
      ),
    create: (data: {
      roomId: string;
      startsAt: string;
      endsAt: string;
      requesterName: string;
      requesterEmail: string;
      requesterPhone?: string;
      notes?: string;
      captchaToken?: string | null;
    }) =>
      fetchAPI<{ id: string } & Record<string, unknown>>('/reservations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Contact
  contact: {
    send: (data: { name: string; email: string; subject: string; message: string }) =>
      fetchAPI<{ success: boolean }>('/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Settings
  settings: {
    getPublic: () =>
      fetchAPI<{
        siteName: string;
        branding: unknown;
        accessibility: unknown;
        contactEmail: string;
        contactPhone: string;
        address: unknown;
      }>('/settings/public', {
        next: { revalidate: 3600 }, // Cache 1 heure
      }),
  },
};

export default api;
