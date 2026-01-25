'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Search,
  Grid,
  List,
  Trash2,
  Download,
  MoreHorizontal,
  Image,
  FileText,
  Video,
  File,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { media as mediaApi, type Media } from '@/lib/api';
import { formatDate } from '@/lib/utils';

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.includes('pdf')) return FileText;
  return File;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

function MediaLibraryContent() {
  const searchParams = useSearchParams();
  const [mediaList, setMediaList] = React.useState<Media[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<string>('all');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = React.useState<Media | null>(null);
  const [deleteMedia, setDeleteMedia] = React.useState<Media | null>(null);
  const [showUploadDialog, setShowUploadDialog] = React.useState(
    searchParams.get('upload') === 'true',
  );

  React.useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      const result = await mediaApi.list();
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

        const { uploadUrl, storageKey } = await mediaApi.presign({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        });

        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        const dimensions = await getImageDimensions(file);

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
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDelete = async () => {
    if (!deleteMedia) return;
    try {
      await mediaApi.delete(deleteMedia.id);
      setMediaList((prev) => prev.filter((m) => m.id !== deleteMedia.id));
      setDeleteMedia(null);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const filteredMedia = React.useMemo(() => {
    let filtered = mediaList;

    if (searchQuery) {
      filtered = filtered.filter((m) =>
        m.filename.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((m) => m.mimeType.startsWith(filterType));
    }

    return filtered;
  }, [mediaList, searchQuery, filterType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Médias</h1>
          <p className="text-muted-foreground">
            Gérez vos images, vidéos et documents
          </p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Téléverser
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un fichier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type de fichier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="image/">Images</SelectItem>
            <SelectItem value="video/">Vidéos</SelectItem>
            <SelectItem value="application/pdf">PDF</SelectItem>
          </SelectContent>
        </Select>
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

      {/* Media Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Image className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Aucun média</h3>
          <p className="text-muted-foreground mt-1">
            Téléversez votre premier fichier pour commencer
          </p>
          <Button className="mt-4" onClick={() => setShowUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Téléverser
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {filteredMedia.map((media) => {
            const Icon = getFileIcon(media.mimeType);
            return (
              <motion.div
                key={media.id}
                variants={item}
                className="group relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer"
                onClick={() => setSelectedMedia(media)}
              >
                {media.mimeType.startsWith('image/') ? (
                  <img
                    src={media.url}
                    alt={media.alt || media.filename}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Icon className="h-12 w-12 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-2 px-2 truncate max-w-full">
                      {media.filename}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteMedia(media);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="rounded-md border">
          {filteredMedia.map((media) => {
            const Icon = getFileIcon(media.mimeType);
            return (
              <div
                key={media.id}
                className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedMedia(media)}
              >
                {media.mimeType.startsWith('image/') ? (
                  <img
                    src={media.url}
                    alt={media.alt || media.filename}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-muted rounded">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{media.filename}</p>
                  <p className="text-sm text-muted-foreground">
                    {media.mimeType} · {formatFileSize(media.size)} ·{' '}
                    {formatDate(media.createdAt)}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(media.url, '_blank');
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteMedia(media);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Téléverser des fichiers</DialogTitle>
            <DialogDescription>
              Glissez-déposez vos fichiers ou cliquez pour sélectionner
            </DialogDescription>
          </DialogHeader>
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
                <p className="font-medium">Glissez-déposez vos fichiers ici</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Images, vidéos, PDF, documents...
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
        </DialogContent>
      </Dialog>

      {/* Media Detail Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.filename}</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {selectedMedia.mimeType.startsWith('image/') ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.alt || selectedMedia.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    {React.createElement(getFileIcon(selectedMedia.mimeType), {
                      className: 'h-16 w-16 text-muted-foreground mx-auto mb-2',
                    })}
                    <p className="text-muted-foreground">
                      Aperçu non disponible
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p>{selectedMedia.mimeType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Taille</Label>
                  <p>{formatFileSize(selectedMedia.size)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date d&apos;ajout</Label>
                  <p>{formatDate(selectedMedia.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">URL</Label>
                  <p className="truncate">{selectedMedia.url}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(selectedMedia.url)}
                >
                  Copier l&apos;URL
                </Button>
                <Button onClick={() => window.open(selectedMedia.url, '_blank')}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteMedia} onOpenChange={() => setDeleteMedia(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce fichier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le fichier sera définitivement
              supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function MediaLibraryPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <MediaLibraryContent />
    </React.Suspense>
  );
}
