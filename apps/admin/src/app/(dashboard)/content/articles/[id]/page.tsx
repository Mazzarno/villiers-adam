'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ContentForm, type ContentFormData } from '@/components/content/content-form';
import { articles, type Article } from '@/lib/api';
import { toast } from 'sonner';

export default function EditArticle() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [articleData, setArticleData] = React.useState<Article | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await articles.get(id);
        setArticleData(data);
      } catch (error) {
        toast.error('Impossible de charger l\'actualité');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSubmit = async (data: ContentFormData) => {
    const status = data.status === 'SCHEDULED' ? 'DRAFT' : data.status;

    if (data.status === 'SCHEDULED') {
      toast.message('Programmez l’actualité via le bouton Programmer.', {
        description: 'Le statut est conservé en brouillon.',
      });
    }

    await articles.update(id, {
      title: data.title,
      slug: data.slug,
      summary: data.summary || null,
      content: data.content || '',
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      status,
      publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : null,
      coverMediaId: data.coverMediaId || null,
      type: data.articleType,
      publicationType: data.publicationType || null,
      documentMediaId: data.documentMediaId || null,
      documentNumber: data.documentNumber || null,
      meetingDate: data.meetingDate ? new Date(data.meetingDate).toISOString() : null,
      publicationYear: data.publicationYear ?? null,
      isFlash: data.isFlash ?? false,
    });

    toast.success('Actualité mise à jour');
    router.refresh();
  };

  const handlePublish = async () => {
    await articles.publish(id);
    toast.success('Actualité publiée');
    router.refresh();
  };

  const handleSchedule = async (scheduledAt: string) => {
    await articles.schedule(id, new Date(scheduledAt).toISOString());
    toast.success('Actualité programmée');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!articleData) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Actualité introuvable</h1>
        <button
          className="text-primary underline"
          onClick={() => router.push('/content/articles')}
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modifier l’actualité</h1>
        <p className="text-muted-foreground">Mettre à jour le contenu et la publication.</p>
      </div>
      <ContentForm
        type="article"
        initialData={articleData}
        onSubmit={handleSubmit}
        onPublish={handlePublish}
        onSchedule={handleSchedule}
      />
    </div>
  );
}
