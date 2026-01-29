'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useForm, useFieldArray } from 'react-hook-form';
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
  Plus,
  Trash2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { slugify } from '@/lib/utils';
import { pages, type Page, type Article, type Event, type Media, type ArticleType, type PublicationType } from '@/lib/api';

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

const blockSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['section', 'cta', 'media']),
  title: z.string().optional(),
  body: z.string().optional(),
  linkLabel: z.string().optional(),
  linkUrl: z.string().optional(),
  mediaId: z.string().optional(),
  mediaUrl: z.string().optional(),
  mediaAlt: z.string().optional(),
});

const contentSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  summary: z.string().optional(),
  content: z.string().optional(),
  blocks: z.array(blockSchema).optional(),
  menuTitle: z.string().optional(),
  showInMenu: z.boolean().optional(),
  menuOrder: optionalNumber,
  parentId: z.string().optional(),
  template: z.string().optional(),
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
  const [showBlockMediaPicker, setShowBlockMediaPicker] = React.useState(false);
  const [activeBlockIndex, setActiveBlockIndex] = React.useState<number | null>(null);
  const [pageOptions, setPageOptions] = React.useState<Page[]>([]);

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

  const initialBlocks = React.useMemo(() => {
    const blocks = (initialData as Page)?.blocks;
    if (Array.isArray(blocks)) return blocks;
    return [];
  }, [initialData]);

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      summary: initialData?.summary ?? '',
      content: initialContent,
      blocks: initialBlocks,
      menuTitle: (initialData as Page)?.menuTitle || '',
      showInMenu: (initialData as Page)?.showInMenu || false,
      menuOrder: (initialData as Page)?.menuOrder ?? undefined,
      parentId: (initialData as Page)?.parentId ?? undefined,
      template: (initialData as Page)?.template || 'standard',
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

  const blocksFieldArray = useFieldArray({
    control: form.control,
    name: 'blocks',
  });

  const watchTitle = form.watch('title');

  React.useEffect(() => {
    if (!initialData?.slug && watchTitle) {
      form.setValue('slug', slugify(watchTitle));
    }
  }, [watchTitle, initialData?.slug, form]);

  React.useEffect(() => {
    if (type !== 'page') return;

    const loadPages = async () => {
      try {
        const result = await pages.list();
        const currentId = (initialData as Page | undefined)?.id;
        setPageOptions(result.filter((page) => page.id !== currentId));
      } catch (error) {
        console.error('Failed to load pages:', error);
      }
    };

    loadPages();
  }, [type, initialData]);

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

  const handleBlockMediaSelect = (media: Media) => {
    if (activeBlockIndex === null) return;
    form.setValue(`blocks.${activeBlockIndex}.mediaId`, media.id);
    form.setValue(`blocks.${activeBlockIndex}.mediaUrl`, media.url);
    form.setValue(`blocks.${activeBlockIndex}.mediaAlt`, media.alt || media.filename || '');
    setShowBlockMediaPicker(false);
    setActiveBlockIndex(null);
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

          {type === 'page' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Blocs de page</CardTitle>
                  <CardDescription>
                    Structurez votre page avec des sections, CTA et visuels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {blocksFieldArray.fields.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Aucun bloc pour le moment. Ajoutez une section pour commencer.
                    </p>
                  )}

                  {blocksFieldArray.fields.map((block, index) => (
                    <div key={block.id} className="space-y-4 rounded-lg border p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs uppercase text-muted-foreground">Bloc</Label>
                          <Select
                            value={form.watch(`blocks.${index}.type`) || block.type}
                            onValueChange={(value) =>
                              form.setValue(
                                `blocks.${index}.type`,
                                value as 'section' | 'cta' | 'media',
                              )
                            }
                          >
                            <SelectTrigger className="h-8 w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="section">Section texte</SelectItem>
                              <SelectItem value="cta">Bloc d&apos;appel à l&apos;action</SelectItem>
                              <SelectItem value="media">Bloc visuel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => blocksFieldArray.remove(index)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Titre</Label>
                        <Input
                          placeholder="Titre du bloc"
                          {...form.register(`blocks.${index}.title` as const)}
                        />
                      </div>

                      {form.watch(`blocks.${index}.type`) === 'section' && (
                        <div className="space-y-2">
                          <Label>Contenu</Label>
                          <Textarea
                            rows={4}
                            placeholder="Contenu de la section"
                            {...form.register(`blocks.${index}.body` as const)}
                          />
                        </div>
                      )}

                      {form.watch(`blocks.${index}.type`) === 'cta' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea
                              rows={3}
                              placeholder="Message de l&apos;appel à l&apos;action"
                              {...form.register(`blocks.${index}.body` as const)}
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Label du bouton</Label>
                              <Input
                                placeholder="Découvrir"
                                {...form.register(`blocks.${index}.linkLabel` as const)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Lien</Label>
                              <Input
                                placeholder="/contact"
                                {...form.register(`blocks.${index}.linkUrl` as const)}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {form.watch(`blocks.${index}.type`) === 'media' && (
                        <div className="space-y-2">
                          <Label>Visuel</Label>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setActiveBlockIndex(index);
                                setShowBlockMediaPicker(true);
                              }}
                            >
                              <ImageIcon className="mr-2 h-4 w-4" />
                              Choisir un média
                            </Button>
                            {form.watch(`blocks.${index}.mediaId`) && (
                              <span className="text-xs text-muted-foreground">
                                Média sélectionné
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        blocksFieldArray.append({
                          type: 'section',
                          title: '',
                          body: '',
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Section
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        blocksFieldArray.append({
                          type: 'cta',
                          title: '',
                          body: '',
                          linkLabel: '',
                          linkUrl: '',
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Appel à l&apos;action
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        blocksFieldArray.append({
                          type: 'media',
                          title: '',
                          mediaId: '',
                          mediaUrl: '',
                          mediaAlt: '',
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Bloc visuel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

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
                    onClick={() => {
                      const token = localStorage.getItem('accessToken');
                      const contentId = initialData?.id;

                      if (!contentId) {
                        alert('Veuillez d\'abord enregistrer le contenu avant de prévisualiser.');
                        return;
                      }

                      if (!token) {
                        alert('Session expirée. Veuillez vous reconnecter.');
                        return;
                      }

                      const previewUrl = `${WEB_URL}/preview/${type}/${contentId}?token=${token}`;
                      window.open(previewUrl, '_blank');
                    }}
                    disabled={!initialData?.id}
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
                      src={resolveMediaUrl(featuredImage.url)}
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

          {type === 'page' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label>Afficher dans le menu</Label>
                      <p className="text-xs text-muted-foreground">
                        Rend la page visible dans la navigation
                      </p>
                    </div>
                    <Switch
                      checked={form.watch('showInMenu')}
                      onCheckedChange={(checked) => form.setValue('showInMenu', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Titre du menu</Label>
                    <Input
                      placeholder="Nom court pour le menu"
                      {...form.register('menuTitle')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Page parente</Label>
                    <Select
                      value={form.watch('parentId') || 'none'}
                      onValueChange={(value) =>
                        form.setValue('parentId', value === 'none' ? undefined : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Aucune" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        {pageOptions.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Ordre</Label>
                      <Input
                        type="number"
                        placeholder="1"
                        {...form.register('menuOrder', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Modèle</Label>
                      <Select
                        value={form.watch('template') || 'standard'}
                        onValueChange={(value) => form.setValue('template', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="landing">Landing</SelectItem>
                          <SelectItem value="guide">Guide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

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
      {showBlockMediaPicker && (
        <MediaPicker
          open={showBlockMediaPicker}
          onOpenChange={setShowBlockMediaPicker}
          onSelect={handleBlockMediaSelect}
          accept={['image/*']}
        />
      )}
    </form>
  );
}
