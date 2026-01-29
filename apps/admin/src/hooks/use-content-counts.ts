import * as React from 'react';

type ContentCounts = {
  draftArticles: number;
  scheduledArticles: number;
  draftEvents: number;
  scheduledEvents: number;
  draftDirectoryEntries: number;
  isLoading: boolean;
};

export function useContentCounts() {
  const [counts, setCounts] = React.useState<ContentCounts>({
    draftArticles: 0,
    scheduledArticles: 0,
    draftEvents: 0,
    scheduledEvents: 0,
    draftDirectoryEntries: 0,
    isLoading: true,
  });

  React.useEffect(() => {
    const loadCounts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const responses = await Promise.all([
          // Articles
          fetch('/api/articles?status=DRAFT', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/articles?status=SCHEDULED', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // Events
          fetch('/api/events?status=DRAFT', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/events?status=SCHEDULED', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // Directory
          fetch('/api/annuaire?status=DRAFT', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [
          draftArticlesData,
          scheduledArticlesData,
          draftEventsData,
          scheduledEventsData,
          draftDirectoryData,
        ] = await Promise.all(responses.map((r) => (r.ok ? r.json() : [])));

        setCounts({
          draftArticles: Array.isArray(draftArticlesData) ? draftArticlesData.length : 0,
          scheduledArticles: Array.isArray(scheduledArticlesData)
            ? scheduledArticlesData.length
            : 0,
          draftEvents: Array.isArray(draftEventsData) ? draftEventsData.length : 0,
          scheduledEvents: Array.isArray(scheduledEventsData) ? scheduledEventsData.length : 0,
          draftDirectoryEntries: Array.isArray(draftDirectoryData)
            ? draftDirectoryData.length
            : 0,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to load content counts:', error);
        setCounts((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadCounts();

    // Refresh every 30 seconds
    const interval = setInterval(loadCounts, 30000);

    return () => clearInterval(interval);
  }, []);

  return counts;
}
