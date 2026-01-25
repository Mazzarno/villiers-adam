'use client';

import { useRouter } from 'next/navigation';
import { ContentForm, type ContentFormData } from '@/components/content/content-form';
import { pages } from '@/lib/api';
import { toast } from 'sonner';

export default function NewPage() {
  const router = useRouter();

  const handleSubmit = async (data: ContentFormData) => {
    const status = data.status === 'SCHEDULED' ? 'DRAFT' : data.status;

    if (data.status === 'SCHEDULED') {
      toast.message('Programmez la page après création.', {
        description: 'Créez la page en brouillon puis utilisez le bouton Programmer.',
      });
    }

    await pages.create({
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

    toast.success('Page créée');
    router.push('/content/pages');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouvelle page</h1>
        <p className="text-muted-foreground">Créez une page statique pour votre site.</p>
      </div>
      <ContentForm type="page" onSubmit={handleSubmit} />
    </div>
  );
}
