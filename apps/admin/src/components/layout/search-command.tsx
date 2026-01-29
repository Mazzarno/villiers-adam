'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Calendar,
  Users,
  Image as ImageIcon,
  Settings,
  Search,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

type SearchResult = {
  id: string;
  title: string;
  type: 'article' | 'event' | 'directory' | 'media';
  url: string;
};

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Toggle command palette with Cmd+K or Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Search when query changes
  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const mappedResults: SearchResult[] = [];

          // Map articles
          if (data.articles) {
            data.articles.forEach((article: { id: string; title: string }) => {
              mappedResults.push({
                id: article.id,
                title: article.title,
                type: 'article',
                url: `/content/articles/${article.id}`,
              });
            });
          }

          // Map events
          if (data.events) {
            data.events.forEach((event: { id: string; title: string }) => {
              mappedResults.push({
                id: event.id,
                title: event.title,
                type: 'event',
                url: `/content/events/${event.id}`,
              });
            });
          }

          // Map directory
          if (data.directoryEntries) {
            data.directoryEntries.forEach((entry: { id: string; name: string }) => {
              mappedResults.push({
                id: entry.id,
                title: entry.name,
                type: 'directory',
                url: `/annuaire/${entry.id}`,
              });
            });
          }

          // Map media
          if (data.media) {
            data.media.forEach((media: { id: string; filename: string }) => {
              mappedResults.push({
                id: media.id,
                title: media.filename || 'Sans titre',
                type: 'media',
                url: `/media?id=${media.id}`,
              });
            });
          }

          setResults(mappedResults);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSelect = (url: string) => {
    setOpen(false);
    setQuery('');
    router.push(url);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'article':
        return FileText;
      case 'event':
        return Calendar;
      case 'directory':
        return Users;
      case 'media':
        return ImageIcon;
      default:
        return FileText;
    }
  };

  const getLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'article':
        return 'Article';
      case 'event':
        return 'Événement';
      case 'directory':
        return 'Annuaire';
      case 'media':
        return 'Média';
      default:
        return 'Contenu';
    }
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Rechercher...</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Rechercher dans le CMS..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.length < 2 ? (
            <CommandEmpty>
              Tapez au moins 2 caractères pour rechercher
            </CommandEmpty>
          ) : isSearching ? (
            <CommandEmpty>
              <div className="flex items-center justify-center p-4">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            </CommandEmpty>
          ) : results.length === 0 ? (
            <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
          ) : (
            <>
              {Object.entries(groupedResults).map(([type, items], index) => (
                <React.Fragment key={type}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={`${getLabel(type as SearchResult['type'])}s`}>
                    {items.map((result) => {
                      const Icon = getIcon(result.type);
                      return (
                        <CommandItem
                          key={result.id}
                          value={result.title}
                          onSelect={() => handleSelect(result.url)}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{result.title}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </React.Fragment>
              ))}
            </>
          )}

          {/* Quick actions */}
          {query.length === 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Actions rapides">
                <CommandItem onSelect={() => handleSelect('/content/articles/new')}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Nouvel article</span>
                </CommandItem>
                <CommandItem onSelect={() => handleSelect('/content/events/new')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Nouvel événement</span>
                </CommandItem>
                <CommandItem onSelect={() => handleSelect('/media')}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  <span>Médias</span>
                </CommandItem>
                <CommandItem onSelect={() => handleSelect('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
