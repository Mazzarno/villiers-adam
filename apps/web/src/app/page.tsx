import { FlashBanner } from '@/components/layout/flash-banner';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { QuickAccess } from '@/components/home/quick-access';
import { NewsSection } from '@/components/home/news-section';
import { EventsSection } from '@/components/home/events-section';
import { CommuneHighlights } from '@/components/home/commune-highlights';
import { FacebookFeed } from '@/components/home/facebook-feed';
import api from '@/lib/api';

export const revalidate = 0;

async function getHomeData() {
  const [articlesResult, eventsResult, flashInfoResult] = await Promise.allSettled([
    api.articles.recent(3),
    api.events.upcoming(3),
    api.flashInfo.active(),
  ]);

  if (articlesResult.status === 'rejected') {
    console.error('Error fetching homepage articles:', articlesResult.reason);
  }

  if (eventsResult.status === 'rejected') {
    console.error('Error fetching homepage events:', eventsResult.reason);
  }

  if (flashInfoResult.status === 'rejected') {
    console.error('Error fetching flash infos:', flashInfoResult.reason);
  }

  return {
    articles: articlesResult.status === 'fulfilled' ? articlesResult.value : [],
    events: eventsResult.status === 'fulfilled' ? eventsResult.value : [],
    flashInfo: flashInfoResult.status === 'fulfilled' ? flashInfoResult.value : [],
  };
}

export default async function HomePage() {
  const { flashInfo, articles, events } = await getHomeData();

  return (
    <>
      {/* Flash info banner */}
      {flashInfo.length > 0 && <FlashBanner items={flashInfo} />}

      {/* Hero section */}
      <HeroCarousel />

      {/* Quick access */}
      <QuickAccess />

      {/* Recent news - toujours affiche, avec fallback statique si vide */}
      <NewsSection articles={articles} />

      {/* Upcoming events - toujours affiche, avec fallback statique si vide */}
      <EventsSection events={events} />

      {/* Chiffres cles de la commune */}
      <CommuneHighlights />

      {/* Facebook feed */}
      <FacebookFeed />
    </>
  );
}
