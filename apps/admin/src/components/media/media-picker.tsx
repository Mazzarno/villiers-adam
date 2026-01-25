'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Search, Grid, List, Loader2, Image, FileText, Video, File } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { media as mediaApi, type Media } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const resolveMediaUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_URL}${url}`;
};

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: Media) => void;
  accept?: string[];
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.includes('pdf')) return FileText;
  return File;
}

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  accept,
}: MediaPickerProps) {
  const [mediaList, setMediaList] = React.useState<Media[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      loadMedia();
    }
  }, [open]);

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      const result = await mediaApi.list({ search: searchQuery });
      setMediaList(result);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number } | null> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];

        // Get presigned upload URL
        const { uploadUrl, storageKey } = await mediaApi.presign({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        });

        // Upload to MinIO
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        // Get image dimensions if applicable
        const dimensions = await getImageDimensions(file);

        // Confirm media record
        await mediaApi.confirm({
          storageKey,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          title: file.name.replace(/\.[^/.]+$/, ''),
          width: dimensions?.width ?? null,
          height: dimensions?.height ?? null,
        });

        setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
      }

      await loadMedia();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept
      ? accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {})
      : undefined,
  });

  const filteredMedia = React.useMemo(() => {
    let filtered = mediaList;

    if (searchQuery) {
      filtered = filtered.filter((m) =>
        m.filename.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (accept) {
      filtered = filtered.filter((m) =>
        accept.some((type) => {
          if (type.endsWith('/*')) {
            return m.mimeType.startsWith(type.replace('/*', '/'));
          }
          return m.mimeType === type;
        }),
      );
    }

    return filtered;
  }, [mediaList, searchQuery, accept]);

  const handleSelect = () => {
    const selected = mediaList.find((m) => m.id === selectedId);
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Bibliothèque de médias</DialogTitle>
          <DialogDescription>
            Sélectionnez un fichier ou téléversez-en un nouveau
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Bibliothèque</TabsTrigger>
            <TabsTrigger value="upload">Téléverser</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-1 border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Image className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun média trouvé</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-4 gap-4 p-1">
                  {filteredMedia.map((item) => {
                    const Icon = getFileIcon(item.mimeType);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-primary',
                          selectedId === item.id
                            ? 'border-primary ring-2 ring-primary ring-offset-2'
                            : 'border-transparent',
                        )}
                      >
                        {item.mimeType.startsWith('image/') ? (
                          <img
                            src={resolveMediaUrl(item.url)}
                            alt={item.alt || item.filename}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full bg-muted">
                            <Icon className="h-8 w-8 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-2 px-2 truncate max-w-full">
                              {item.filename}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2 p-1">
                  {filteredMedia.map((item) => {
                    const Icon = getFileIcon(item.mimeType);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={cn(
                          'w-full flex items-center gap-4 p-3 rounded-lg border-2 transition-all hover:border-primary text-left',
                          selectedId === item.id
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent bg-muted/50',
                        )}
                      >
                        {item.mimeType.startsWith('image/') ? (
                          <img
                            src={resolveMediaUrl(item.url)}
                            alt={item.alt || item.filename}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-muted rounded">
                            <Icon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.mimeType} · {(item.size / 1024).toFixed(1)} Ko
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={handleSelect} disabled={!selectedId}>
                Sélectionner
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary',
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              {isDragActive ? (
                <p className="text-primary">Déposez les fichiers ici...</p>
              ) : (
                <>
                  <p className="font-medium">
                    Glissez-déposez vos fichiers ici
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou cliquez pour sélectionner
                  </p>
                </>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Téléversement en cours...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
