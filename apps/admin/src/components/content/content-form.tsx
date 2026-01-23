'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Save,
  Send,
  Clock,
  Eye,
  Loader2,
  ImageIcon,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { MediaPicker } from '@/components/media/media-picker';
import { slugify } from '@/lib/utils';
import type { Page, Article, Event, Media } from '@/lib/api';

const contentSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']),
  publishedAt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  featuredImageId: z.string().optional(),
  // Event specific
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  location: z.string().optional(),
});

type ContentFormData = z.infer<typeof contentSchema>;

interface ContentFormProps {
  type: 'page' | 'article' | 'event';
  initialData?: Partial<Page | Article | Event>;
  onSubmit: (data: ContentFormData) => Promise<void>;
  onPublish?: () => Promise<void>;
  onSchedule?: (date: string) => Promise<void>;
}

export function ContentForm({
  type,
  initialData,
  onSubmit,
  onPublish,
  onSchedule,
}: ContentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showMediaPicker, setShowMediaPicker] = React.useState(false);
  const [featuredImage, setFeaturedImage] = React.useState<Media | null>(
    (initialData as any)?.featuredImage || null,
  );
  const [scheduleDate, setScheduleDate] = React.useState('');

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      excerpt: initialData?.excerpt || '',
      content: (initialData?.content as string) || '',
      status: initialData?.status || 'DRAFT',
      publishedAt: initialData?.publishedAt || '',
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
      featuredImageId: initialData?.featuredImageId || '',
      startsAt: (initialData as Event)?.startsAt || '',
      endsAt: (initialData as Event)?.endsAt || '',
      location: (initialData as Event)?.location || '',
    },
  });

  const watchTitle = form.watch('title');

  React.useEffect(() => {
    if (!initialData?.slug && watchTitle) {
      form.setValue('slug', slugify(watchTitle));
    }
  }, [watchTitle, initialData?.slug, form]);

  const handleSubmit = async (data: ContentFormData) => {
    setIsSaving(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!onPublish) return;
    setIsLoading(true);
    try {
      await form.handleSubmit(handleSubmit)();
      await onPublish();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!onSchedule || !scheduleDate) return;
    setIsLoading(true);
    try {
      await form.handleSubmit(handleSubmit)();
      await onSchedule(scheduleDate);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (media: Media) => {
    setFeaturedImage(media);
    form.setValue('featuredImageId', media.id);
    setShowMediaPicker(false);
  };

  const typeLabels = {
    page: 'Page',
    article: 'Actualité',
    event: 'Événement',
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Contenu</CardTitle>
                <CardDescription>
                  Rédigez le contenu de votre {typeLabels[type].toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    placeholder={`Titre de la ${typeLabels[type].toLowerCase()}`}
                    {...form.register('title')}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">/</span>
                    <Input
                      id="slug"
                      placeholder="mon-titre"
                      {...form.register('slug')}
                    />
                  </div>
                  {form.formState.errors.slug && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Résumé</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Un court résumé..."
                    rows={3}
                    {...form.register('excerpt')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contenu</Label>
                  <TiptapEditor
                    content={form.watch('content') || ''}
                    onChange={(html) => form.setValue('content', html)}
                    onImageUpload={() => setShowMediaPicker(true)}
                    placeholder="Commencez à écrire le contenu..."
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Event specific fields */}
          {type === 'event' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Détails de l&apos;événement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startsAt">Date de début</Label>
                      <Input
                        id="startsAt"
                        type="datetime-local"
                        {...form.register('startsAt')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endsAt">Date de fin</Label>
                      <Input
                        id="endsAt"
                        type="datetime-local"
                        {...form.register('endsAt')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Lieu</Label>
                    <Input
                      id="location"
                      placeholder="Salle des fêtes, Place de la Mairie..."
                      {...form.register('location')}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* SEO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>
                  Optimisez le référencement de votre contenu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Titre SEO</Label>
                  <Input
                    id="metaTitle"
                    placeholder="Titre pour les moteurs de recherche"
                    {...form.register('metaTitle')}
                  />
                  <p className="text-xs text-muted-foreground">
                    {form.watch('metaTitle')?.length || 0}/60 caractères
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Description SEO</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Description pour les moteurs de recherche"
                    rows={3}
                    {...form.register('metaDescription')}
                  />
                  <p className="text-xs text-muted-foreground">
                    {form.watch('metaDescription')?.length || 0}/160 caractères
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Enregistrer
                  </Button>

                  {form.watch('status') === 'DRAFT' && onPublish && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handlePublish}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Publier maintenant
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(`/preview/${form.watch('slug')}`, '_blank')}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Prévisualiser
                  </Button>
                </div>

                {onSchedule && form.watch('status') === 'DRAFT' && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="schedule">Programmer</Label>
                    <div className="flex gap-2">
                      <Input
                        id="schedule"
                        type="datetime-local"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleSchedule}
                        disabled={!scheduleDate || isLoading}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Image à la une</CardTitle>
              </CardHeader>
              <CardContent>
                {featuredImage ? (
                  <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                    <img
                      src={featuredImage.url}
                      alt={featuredImage.alt || ''}
                      className="object-cover w-full h-full"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFeaturedImage(null);
                        form.setValue('featuredImageId', '');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 flex-col gap-2"
                    onClick={() => setShowMediaPicker(true)}
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span>Choisir une image</span>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Statut</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={form.watch('status')}
                  onValueChange={(value) => form.setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                    <SelectItem value="PUBLISHED">Publié</SelectItem>
                    <SelectItem value="SCHEDULED">Programmé</SelectItem>
                    <SelectItem value="ARCHIVED">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Media Picker Dialog */}
      <MediaPicker
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        onSelect={handleImageSelect}
        accept={['image/*']}
      />
    </form>
  );
}
