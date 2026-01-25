'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ContentForm, type ContentFormData } from '@/components/content/content-form';
import { pages, type Page } from '@/lib/api';
import { toast } from 'sonner';

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [pageData, setPageData] = React.useState<Page | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await pages.get(id);
        setPageData(data);
      } catch (error) {
        toast.error('Impossible de charger la page');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSubmit = async (data: ContentFormData) => {
    const status = data.status === 'SCHEDULED' ? 'DRAFT' : data.status;

    if (data.status === 'SCHEDULED') {
      toast.message('Programmez la page via le bouton Programmer.', {
        description: 'Le statut sera conservé en brouillon.',
      });
    }

    await pages.update(id, {
      title: data.title,
      slug: data.slug,
      summary: data.summary || null,
      content: data.content || '',
      blocks: data.blocks || [],
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      menuTitle: data.menuTitle || null,
      showInMenu: data.showInMenu ?? false,
      menuOrder: data.menuOrder ?? 0,
      parentId: data.parentId || null,
      template: data.template || null,
      status,
      publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : null,
      coverMediaId: data.coverMediaId || null,
    });

    toast.success('Page mise à jour');
    router.refresh();
  };

  const handlePublish = async () => {
    await pages.publish(id);
    toast.success('Page publiée');
    router.refresh();
  };

  const handleSchedule = async (scheduledAt: string) => {
    await pages.schedule(id, new Date(scheduledAt).toISOString());
    toast.success('Page programmée');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Page introuvable</h1>
        <button
          className="text-primary underline"
          onClick={() => router.push('/content/pages')}
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modifier la page</h1>
        <p className="text-muted-foreground">Mettre à jour le contenu et la publication.</p>
      </div>
      <ContentForm
        type="page"
        initialData={pageData}
        onSubmit={handleSubmit}
        onPublish={handlePublish}
        onSchedule={handleSchedule}
      />
    </div>
  );
}
