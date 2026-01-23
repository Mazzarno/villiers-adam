import { Suspense } from 'react';
import { FlashBanner } from '@/components/layout/flash-banner';
import { Hero } from '@/components/home/hero';
import { QuickAccess } from '@/components/home/quick-access';
import { NewsSection } from '@/components/home/news-section';
import { EventsSection } from '@/components/home/events-section';
import { MayorMessage } from '@/components/home/mayor-message';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

// Démonstration - données statiques en attendant l'API
const demoFlashInfo = [
  {
    id: '1',
    message: 'Collecte des encombrants le samedi 25 janvier - Inscriptions ouvertes',
    type: 'info' as const,
    link: '/actualites/collecte-encombrants',
  },
];

const demoArticles = [
  {
    id: '1',
    title: 'Travaux de voirie : réfection de la rue principale',
    slug: 'travaux-voirie-rue-principale',
    content: '',
    excerpt: 'La commune entreprend des travaux de réfection de la chaussée rue principale. Circulation alternée prévue du 15 au 30 janvier.',
    featuredImage: '/images/placeholder-news.jpg',
    category: { id: '1', name: 'Travaux', slug: 'travaux' },
    tags: ['travaux', 'voirie'],
    authorId: '1',
    status: 'published' as const,
    publishedAt: '2025-01-10T10:00:00Z',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
  },
  {
    id: '2',
    title: 'Nouveau service de navette vers la gare',
    slug: 'nouveau-service-navette',
    content: '',
    excerpt: 'À partir du 1er février, une navette gratuite reliera le village à la gare de Presles-Courcelles.',
    featuredImage: '/images/placeholder-news.jpg',
    category: { id: '2', name: 'Transports', slug: 'transports' },
    tags: ['transports', 'mobilité'],
    authorId: '1',
    status: 'published' as const,
    publishedAt: '2025-01-08T14:00:00Z',
    createdAt: '2025-01-08T14:00:00Z',
    updatedAt: '2025-01-08T14:00:00Z',
  },
  {
    id: '3',
    title: 'Concours photo : notre village en hiver',
    slug: 'concours-photo-hiver',
    content: '',
    excerpt: 'Participez au concours photo organisé par la mairie et tentez de gagner des lots offerts par les commerçants locaux.',
    featuredImage: '/images/placeholder-news.jpg',
    category: { id: '3', name: 'Culture', slug: 'culture' },
    tags: ['culture', 'concours'],
    authorId: '1',
    status: 'published' as const,
    publishedAt: '2025-01-05T09:00:00Z',
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-01-05T09:00:00Z',
  },
];

const demoEvents = [
  {
    id: '1',
    title: 'Vœux du Maire à la population',
    slug: 'voeux-maire-2025',
    description: 'La municipalité vous convie à la cérémonie des vœux du Maire.',
    startDate: '2025-01-26T18:00:00Z',
    allDay: false,
    location: 'Salle des fêtes',
    category: 'Cérémonie',
    status: 'published' as const,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Atelier créatif enfants',
    slug: 'atelier-creatif-fevrier',
    description: 'Atelier de création artistique pour les enfants de 6 à 12 ans.',
    startDate: '2025-02-08T14:00:00Z',
    allDay: false,
    location: 'Bibliothèque municipale',
    category: 'Jeunesse',
    status: 'published' as const,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Marché de producteurs',
    slug: 'marche-producteurs-fevrier',
    description: 'Rendez-vous mensuel avec les producteurs locaux du Vexin.',
    startDate: '2025-02-15T09:00:00Z',
    allDay: false,
    location: 'Place de la Mairie',
    category: 'Marché',
    status: 'published' as const,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// En production, ces données viendraient de l'API
async function getHomeData() {
  try {
    // const [flashInfo, articles, events] = await Promise.all([
    //   api.flashInfo.active(),
    //   api.articles.recent(3),
    //   api.events.upcoming(3),
    // ]);
    // return { flashInfo, articles, events };

    // Utilisation des données de démo en attendant l'API
    return {
      flashInfo: demoFlashInfo,
      articles: demoArticles,
      events: demoEvents,
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return {
      flashInfo: [],
      articles: [],
      events: [],
    };
  }
}

export default async function HomePage() {
  const { flashInfo, articles, events } = await getHomeData();

  return (
    <>
      {/* Flash info banner */}
      {flashInfo.length > 0 && <FlashBanner items={flashInfo} />}

      {/* Hero section */}
      <Hero />

      {/* Quick access */}
      <QuickAccess />

      {/* Recent news */}
      {articles.length > 0 && <NewsSection articles={articles} />}

      {/* Mayor's message */}
      <MayorMessage />

      {/* Upcoming events */}
      {events.length > 0 && <EventsSection events={events} />}
    </>
  );
}
