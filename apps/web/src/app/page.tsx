import { FlashBanner } from '@/components/layout/flash-banner';
import { Hero } from '@/components/home/hero';
import { QuickAccess } from '@/components/home/quick-access';
import { NewsSection } from '@/components/home/news-section';
import { EventsSection } from '@/components/home/events-section';
import { FacebookFeed } from '@/components/home/facebook-feed';
import api from '@/lib/api';

export const revalidate = 0;

async function getHomeData() {
  try {
    const [articles, events, flashInfo] = await Promise.all([
      api.articles.recent(3),
      api.events.upcoming(3),
      api.flashInfo.active(),
    ]);

    return {
      flashInfo,
      articles,
      events,
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

      {/* Upcoming events */}
      {events.length > 0 && <EventsSection events={events} />}

      {/* Facebook feed */}
      <FacebookFeed />
    </>
  );
}
