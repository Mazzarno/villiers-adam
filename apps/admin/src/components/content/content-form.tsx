'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import NextImage from 'next/image';
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
  Zap,
  FileText,
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
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { slugify } from '@/lib/utils';
import {
  previewDrafts,
  type Article,
  type Event,
  type Media,
  type ArticleType,
  type PublicationType,
} from '@/lib/api';
import { openSecurePreview } from '@/lib/preview';

const TiptapEditor = dynamic(
  () => import('@/components/editor/tiptap-editor').then((mod) => mod.TiptapEditor),
  { ssr: false }
);

const MediaPicker = dynamic(
  () => import('@/components/media/media-picker').then((mod) => mod.MediaPicker),
  { ssr: false }
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

const resolveMediaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
};

const optionalNumber = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'number' && Number.isNaN(value)) return undefined;
    return value;
  },
  z.number().int().optional(),
);

const contentSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  summary: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']),
  publishedAt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  coverMediaId: z.string().optional(),
  // Article specific
  articleType: z.enum(['ACTUALITE', 'PUBLICATION', 'BREVE']).optional(),
  publicationType: z.enum(['ARRETE', 'COMPTE_RENDU', 'DELIBERATION']).optional(),
  documentMediaId: z.string().optional(),
  documentNumber: z.string().optional(),
  meetingDate: z.string().optional(),
  publicationYear: optionalNumber,
  isFlash: z.boolean().optional(),
  // Event specific
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  locationName: z.string().optional(),
});

export type ContentFormData = z.infer<typeof contentSchema>;

interface ContentFormProps {
  type: 'article' | 'event';
  initialData?: Partial<Article | Event>;
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showMediaPicker, setShowMediaPicker] = React.useState(false);
  const [featuredImage, setFeaturedImage] = React.useState<Media | null>(
    initialData?.coverMedia ?? null,
  );
  const [documentMedia, setDocumentMedia] = React.useState<Media | null>(
    (initialData as Article)?.documentMedia ?? null,
  );
  const [scheduleDate, setScheduleDate] = React.useState('');
  const [showDocumentPicker, setShowDocumentPicker] = React.useState(false);

  const toDateTimeLocal = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const pad = (val: number) => String(val).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}`;
  };

  const toDateInput = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const pad = (val: number) => String(val).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const initialContent = React.useMemo(() => {
    if (!initialData?.content) return '';
    if (typeof initialData.content === 'string') return initialData.content;
    try {
      return JSON.stringify(initialData.content);
    } catch {
      return '';
    }
  }, [initialData]);

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      summary: initialData?.summary ?? '',
      content: initialContent,
      status: initialData?.status || 'DRAFT',
      publishedAt: toDateTimeLocal(initialData?.publishedAt || ''),
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
      coverMediaId: initialData?.coverMediaId ?? '',
      articleType: (initialData as Article)?.type || 'ACTUALITE',
      publicationType: (initialData as Article)?.publicationType ?? undefined,
      documentMediaId: (initialData as Article)?.documentMediaId ?? undefined,
      documentNumber: (initialData as Article)?.documentNumber ?? '',
      meetingDate: toDateInput((initialData as Article)?.meetingDate ?? ''),
      publicationYear: (initialData as Article)?.publicationYear ?? undefined,
      isFlash: (initialData as Article)?.isFlash || false,
      startsAt: toDateTimeLocal((initialData as Event)?.startsAt || ''),
      endsAt: toDateTimeLocal((initialData as Event)?.endsAt || ''),
      locationName: (initialData as Event)?.locationName || '',
    },
  });

  const watchTitle = form.watch('title');
  const watchSummary = form.watch('summary');
  const watchContent = form.watch('content');
  const watchMetaTitle = form.watch('metaTitle');
  const watchMetaDescription = form.watch('metaDescription');
  const watchLocationName = form.watch('locationName');
  const watchArticleType = form.watch('articleType');
  const watchDocumentMediaId = form.watch('documentMediaId');
  const watchDocumentNumber = form.watch('documentNumber');
  const watchCoverMediaId = form.watch('coverMediaId');

  const contentText = React.useMemo(() => {
    if (!watchContent) return '';
    if (typeof watchContent !== 'string') return '';
    return watchContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }, [watchContent]);

  const qualityChecks = React.useMemo(() => {
    const checks = [
      {
        label: 'Titre explicite',
        ok: (watchTitle || '').trim().length >= 6,
        hint: '≥ 6 caractères',
      },
      {
        label: 'Résumé informatif',
        ok: (watchSummary || '').trim().length >= 60,
        hint: '≥ 60 caractères',
      },
      {
        label: 'Image à la une',
        ok: Boolean(watchCoverMediaId || featuredImage?.id),
      },
      {
        label: 'Contenu rédigé',
        ok: contentText.length >= 80,
        hint: '≥ 80 caractères',
      },
      {
        label: 'SEO renseigné',
        ok: Boolean((watchMetaTitle || '').trim()) && Boolean((watchMetaDescription || '').trim()),
      },
    ];

    if (type === 'event') {
      checks.push({
        label: 'Lieu renseigné',
        ok: Boolean((watchLocationName || '').trim()),
      });
    }

    if (type === 'article' && watchArticleType === 'PUBLICATION') {
      checks.push({
        label: 'Document associé',
        ok: Boolean((watchDocumentMediaId || '').trim()) || Boolean((watchDocumentNumber || '').trim()),
        hint: 'PDF ou numéro',
      });
    }

    return checks;
  }, [
    watchTitle,
    watchSummary,
    watchCoverMediaId,
    contentText,
    watchMetaTitle,
    watchMetaDescription,
    watchLocationName,
    watchArticleType,
    watchDocumentMediaId,
    watchDocumentNumber,
    featuredImage,
    type,
  ]);

  const qualityScore = Math.round(
    (qualityChecks.filter((check) => check.ok).length / Math.max(qualityChecks.length, 1)) * 100,
  );

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
    form.setValue('coverMediaId', media.id);
    setShowMediaPicker(false);
  };

  const handleDocumentSelect = (media: Media) => {
    setDocumentMedia(media);
    form.setValue('documentMediaId', media.id);
    setShowDocumentPicker(false);
  };

  const toIsoOrNull = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  const typeLabels = {
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
                  <Label htmlFor="summary">Résumé</Label>
                  <Textarea
                    id="summary"
                    placeholder="Un court résumé..."
                    rows={3}
                    {...form.register('summary')}
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

          {/* Article specific fields */}
          {type === 'article' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Type d&apos;actualité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="articleType">Type</Label>
                    <Select
                      value={form.watch('articleType')}
                      onValueChange={(value) =>
                        form.setValue('articleType', value as ArticleType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTUALITE">Actualité</SelectItem>
                        <SelectItem value="PUBLICATION">Publication administrative</SelectItem>
                        <SelectItem value="BREVE">Brève</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {form.watch('articleType') === 'ACTUALITE' && 'Informations générales et communiqués'}
                      {form.watch('articleType') === 'PUBLICATION' && 'Arrêtés, délibérations, comptes-rendus'}
                      {form.watch('articleType') === 'BREVE' && 'Informations courtes et urgentes'}
                    </p>
                  </div>

                  {form.watch('articleType') === 'PUBLICATION' && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="space-y-2">
                        <Label>Type de publication</Label>
                        <Select
                          value={form.watch('publicationType') || 'none'}
                          onValueChange={(value) =>
                            form.setValue(
                              'publicationType',
                              value === 'none' ? undefined : (value as PublicationType),
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Non défini</SelectItem>
                            <SelectItem value="ARRETE">Arrêté municipal</SelectItem>
                            <SelectItem value="COMPTE_RENDU">Compte-rendu</SelectItem>
                            <SelectItem value="DELIBERATION">Délibération</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Numéro de document</Label>
                          <Input
                            placeholder="2025-001"
                            {...form.register('documentNumber')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Année</Label>
                          <Input
                            type="number"
                            placeholder="2025"
                            {...form.register('publicationYear', { valueAsNumber: true })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Date de séance</Label>
                        <Input type="date" {...form.register('meetingDate')} />
                      </div>

                      <div className="space-y-2">
                        <Label>Document PDF (optionnel)</Label>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowDocumentPicker(true)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Choisir un PDF
                          </Button>
                          {documentMedia && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {documentMedia.filename}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDocumentMedia(null);
                                  form.setValue('documentMediaId', '');
                                }}
                              >
                                Retirer
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <Label htmlFor="isFlash">Flash info</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Afficher en bannière sur le site
                      </p>
                    </div>
                    <Switch
                      id="isFlash"
                      checked={form.watch('isFlash')}
                      onCheckedChange={(checked) => form.setValue('isFlash', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

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
                    <Label htmlFor="locationName">Lieu</Label>
                    <Input
                      id="locationName"
                      placeholder="Salle des fêtes, Place de la Mairie..."
                      {...form.register('locationName')}
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
                    onClick={async () => {
                      try {
                        const values = form.getValues();
                        const sourceId = initialData?.id ?? null;

                        const previewDraft =
                          type === 'article'
                            ? await previewDrafts.create({
                                type: 'article',
                                sourceId,
                                data: {
                                  title: values.title,
                                  slug: values.slug || null,
                                  summary: values.summary || null,
                                  content: values.content || '',
                                  status: values.status,
                                  publishedAt: toIsoOrNull(values.publishedAt),
                                  createdAt: (initialData?.createdAt as string | undefined) ?? null,
                                  updatedAt: new Date().toISOString(),
                                  coverMediaId: values.coverMediaId || null,
                                  type: values.articleType,
                                  publicationType: values.publicationType || null,
                                  documentMediaId: values.documentMediaId || null,
                                  documentNumber: values.documentNumber || null,
                                  meetingDate: toIsoOrNull(values.meetingDate),
                                  publicationYear: values.publicationYear ?? null,
                                  isFlash: values.isFlash ?? false,
                                },
                              })
                            : await previewDrafts.create({
                                type: 'event',
                                sourceId,
                                data: {
                                  title: values.title,
                                  slug: values.slug || null,
                                  summary: values.summary || null,
                                  content: values.content || '',
                                  status: values.status,
                                  publishedAt: toIsoOrNull(values.publishedAt),
                                  createdAt: (initialData?.createdAt as string | undefined) ?? null,
                                  updatedAt: new Date().toISOString(),
                                  coverMediaId: values.coverMediaId || null,
                                  locationName: values.locationName || null,
                                  address: null,
                                  startsAt: toIsoOrNull(values.startsAt),
                                  endsAt: toIsoOrNull(values.endsAt),
                                },
                              });

                        openSecurePreview({
                          webUrl: WEB_URL,
                          previewUrlPath: previewDraft.previewUrlPath,
                        });
                      } catch (error) {
                        console.error('Failed to create preview draft:', error);
                        alert('Prévisualisation indisponible. Vérifiez votre session admin.');
                      }
                    }}
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Qualité</CardTitle>
                <CardDescription>Vérifiez les éléments essentiels avant publication.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Score</span>
                    <span className="font-medium">{qualityScore}%</span>
                  </div>
                  <Progress value={qualityScore} />
                </div>
                <div className="space-y-2">
                  {qualityChecks.map((check) => (
                    <div key={check.label} className="flex items-start gap-2 text-sm">
                      <span
                        className={`mt-1 h-2 w-2 rounded-full ${
                          check.ok ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span>{check.label}</span>
                          {!check.ok && check.hint && (
                            <span className="text-xs text-muted-foreground">{check.hint}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                    <NextImage
                      src={resolveMediaUrl(featuredImage.url)}
                      alt={featuredImage.alt || ''}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      unoptimized
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFeaturedImage(null);
                        form.setValue('coverMediaId', '');
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
                  onValueChange={(value) =>
                    form.setValue('status', value as ContentFormData['status'])
                  }
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
      {showMediaPicker && (
        <MediaPicker
          open={showMediaPicker}
          onOpenChange={setShowMediaPicker}
          onSelect={handleImageSelect}
          accept={['image/*']}
        />
      )}
      {showDocumentPicker && (
        <MediaPicker
          open={showDocumentPicker}
          onOpenChange={setShowDocumentPicker}
          onSelect={handleDocumentSelect}
          accept={['application/pdf']}
        />
      )}
    </form>
  );
}
