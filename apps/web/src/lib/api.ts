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

// Types
export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category?: Category;
  categoryId?: string;
  tags: string[];
  author?: User;
  authorId: string;
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
  hours?: string;
  coordinates?: { lat: number; lng: number };
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
    list: (params?: { status?: string }) =>
      fetchAPI<Page[]>('/pages', { params }),
    get: (slug: string) => fetchAPI<Page>(`/pages/${slug}`),
  },

  // Articles
  articles: {
    list: (params?: { page?: number; pageSize?: number; category?: string; status?: string }) =>
      fetchAPI<PaginatedResponse<Article>>('/articles', { params }),
    get: (slug: string) => fetchAPI<Article>(`/articles/${slug}`),
    recent: (limit = 5) =>
      fetchAPI<Article[]>('/articles/recent', { params: { limit } }),
  },

  // Categories
  categories: {
    list: () => fetchAPI<Category[]>('/categories'),
  },

  // Events
  events: {
    list: (params?: { page?: number; pageSize?: number; from?: string; to?: string }) =>
      fetchAPI<PaginatedResponse<Event>>('/events', { params }),
    get: (slug: string) => fetchAPI<Event>(`/events/${slug}`),
    upcoming: (limit = 5) =>
      fetchAPI<Event[]>('/events/upcoming', { params: { limit } }),
  },

  // Flash info
  flashInfo: {
    active: () => fetchAPI<FlashInfo[]>('/flash-info/active'),
  },

  // Directory
  directory: {
    list: (params?: { category?: string; search?: string }) =>
      fetchAPI<DirectoryEntry[]>('/directory', { params }),
    categories: () => fetchAPI<string[]>('/directory/categories'),
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
    submit: (formId: string, data: Record<string, unknown>) =>
      fetchAPI<{ success: boolean; message: string }>(`/forms/${formId}/submit`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Reservations
  reservations: {
    availability: (resourceId: string, date: string) =>
      fetchAPI<{ slots: { time: string; available: boolean }[] }>(
        `/reservations/availability/${resourceId}`,
        { params: { date } }
      ),
    create: (data: {
      resourceId: string;
      date: string;
      time: string;
      name: string;
      email: string;
      phone?: string;
      notes?: string;
    }) =>
      fetchAPI<{ success: boolean; reservationId: string }>('/reservations', {
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
};

export default api;
