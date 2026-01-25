'use client';

import { useRouter } from 'next/navigation';
import { ContentForm, type ContentFormData } from '@/components/content/content-form';
import { articles } from '@/lib/api';
import { toast } from 'sonner';

export default function NewArticle() {
  const router = useRouter();

  const handleSubmit = async (data: ContentFormData) => {
    const status = data.status === 'SCHEDULED' ? 'DRAFT' : data.status;

    if (data.status === 'SCHEDULED') {
      toast.message('Programmez l’actualité après création.', {
        description: 'Créez l’actualité en brouillon puis utilisez le bouton Programmer.',
      });
    }

    await articles.create({
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

    toast.success('Actualité créée');
    router.push('/content/articles');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouvelle actualité</h1>
        <p className="text-muted-foreground">Créez une actualité publiée sur le site.</p>
      </div>
      <ContentForm type="article" onSubmit={handleSubmit} />
    </div>
  );
}
