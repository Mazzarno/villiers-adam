'use client';

import * as React from 'react';
import { FileText, Loader2, Plus, Save, Trash2, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  settings,
  type RestaurationScolaireContent,
  type RestaurationScolaireDocument,
  type RestaurationScolaireMenu,
  type RestaurationScolaireMenuFormat,
  type Settings,
} from '@/lib/api';
import { toast } from 'sonner';

type JsonRecord = Record<string, unknown>;

const MENU_FORMAT_OPTIONS: Array<{ value: RestaurationScolaireMenuFormat; label: string }> = [
  { value: 'TEXT', label: 'Texte' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'PDF', label: 'PDF' },
  { value: 'MIXED', label: 'Mixte' },
];

const createMenu = (): RestaurationScolaireMenu => ({
  weekLabel: '',
  validFrom: '',
  validTo: '',
  format: 'TEXT',
  textContent: '',
  imageMediaId: '',
  imageUrl: '',
  pdfMediaId: '',
  pdfUrl: '',
});

const createDocument = (): RestaurationScolaireDocument => ({
  title: '',
  description: '',
  mediaId: '',
  url: '',
});

const createEmptyContent = (): RestaurationScolaireContent => ({
  title: '',
  intro: '',
  menuCourant: createMenu(),
  tarifs: '',
  inscription: '',
  allergies: '',
  engagements: '',
  documents: [],
});

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeFormat(value: unknown): RestaurationScolaireMenuFormat | undefined {
  if (value === 'TEXT' || value === 'IMAGE' || value === 'PDF' || value === 'MIXED') {
    return value;
  }
  return undefined;
}

function normalizeRestauration(value: unknown): RestaurationScolaireContent {
  if (!isRecord(value)) {
    return createEmptyContent();
  }

  const menuRecord = isRecord(value.menuCourant) ? value.menuCourant : {};

  const menuCourant: RestaurationScolaireMenu = {
    weekLabel: toOptionalString(menuRecord.weekLabel) || '',
    validFrom: toOptionalString(menuRecord.validFrom) || '',
    validTo: toOptionalString(menuRecord.validTo) || '',
    format: normalizeFormat(menuRecord.format) || 'TEXT',
    textContent: toOptionalString(menuRecord.textContent) || '',
    imageMediaId: toOptionalString(menuRecord.imageMediaId) || '',
    imageUrl: toOptionalString(menuRecord.imageUrl) || '',
    pdfMediaId: toOptionalString(menuRecord.pdfMediaId) || '',
    pdfUrl: toOptionalString(menuRecord.pdfUrl) || '',
    updatedAt: toOptionalString(menuRecord.updatedAt),
  };

  const documents = Array.isArray(value.documents)
    ? value.documents
      .filter(isRecord)
      .map((document) => ({
        title: toOptionalString(document.title) || '',
        description: toOptionalString(document.description),
        mediaId: toOptionalString(document.mediaId),
        url: toOptionalString(document.url),
      }))
    : [];

  return {
    title: toOptionalString(value.title) || '',
    intro: toOptionalString(value.intro) || '',
    menuCourant,
    tarifs: toOptionalString(value.tarifs) || '',
    inscription: toOptionalString(value.inscription) || '',
    allergies: toOptionalString(value.allergies) || '',
    engagements: toOptionalString(value.engagements) || '',
    documents,
    updatedAt: toOptionalString(value.updatedAt),
  };
}

function sanitizeRestauration(content: RestaurationScolaireContent): RestaurationScolaireContent {
  const menu = content.menuCourant || createMenu();

  const menuCourant: RestaurationScolaireMenu | undefined =
    toOptionalString(menu.weekLabel) ||
      toOptionalString(menu.validFrom) ||
      toOptionalString(menu.validTo) ||
      normalizeFormat(menu.format) ||
      toOptionalString(menu.textContent) ||
      toOptionalString(menu.imageMediaId) ||
      toOptionalString(menu.imageUrl) ||
      toOptionalString(menu.pdfMediaId) ||
      toOptionalString(menu.pdfUrl)
      ? {
        weekLabel: toOptionalString(menu.weekLabel),
        validFrom: toOptionalString(menu.validFrom),
        validTo: toOptionalString(menu.validTo),
        format: normalizeFormat(menu.format) || 'TEXT',
        textContent: toOptionalString(menu.textContent),
        imageMediaId: toOptionalString(menu.imageMediaId),
        imageUrl: toOptionalString(menu.imageUrl),
        pdfMediaId: toOptionalString(menu.pdfMediaId),
        pdfUrl: toOptionalString(menu.pdfUrl),
        updatedAt: new Date().toISOString(),
      }
      : undefined;

  const documents = (content.documents || [])
    .map((document) => ({
      title: document.title.trim(),
      description: toOptionalString(document.description),
      mediaId: toOptionalString(document.mediaId),
      url: toOptionalString(document.url),
    }))
    .filter((document) => document.title.length > 0);

  return {
    title: content.title?.trim(),
    intro: content.intro?.trim(),
    menuCourant,
    tarifs: toOptionalString(content.tarifs),
    inscription: toOptionalString(content.inscription),
    allergies: toOptionalString(content.allergies),
    engagements: toOptionalString(content.engagements),
    documents,
    updatedAt: new Date().toISOString(),
  };
}

function readRestaurationFromSettings(data: Settings): RestaurationScolaireContent {
  const profile = isRecord(data.municipalityProfile) ? data.municipalityProfile : undefined;
  const vieQuotidienne = profile && isRecord(profile.vieQuotidienne) ? profile.vieQuotidienne : undefined;
  return normalizeRestauration(vieQuotidienne?.restaurationScolaire);
}

export default function RestaurationPage() {
  const [currentSettings, setCurrentSettings] = React.useState<Settings | null>(null);
  const [form, setForm] = React.useState<RestaurationScolaireContent>(createEmptyContent());
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);

  const loadSettings = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const data = await settings.get();
      setCurrentSettings(data);
      setForm(readRestaurationFromSettings(data));
    } catch (error) {
      console.error('Failed to load restauration scolaire settings:', error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateField = <K extends keyof RestaurationScolaireContent>(
    key: K,
    value: RestaurationScolaireContent[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateMenu = <K extends keyof RestaurationScolaireMenu>(
    key: K,
    value: RestaurationScolaireMenu[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      menuCourant: {
        ...(prev.menuCourant || createMenu()),
        [key]: value,
      },
    }));
  };

  const updateDocument = <K extends keyof RestaurationScolaireDocument>(
    index: number,
    key: K,
    value: RestaurationScolaireDocument[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      documents: (prev.documents || []).map((document, documentIndex) =>
        documentIndex === index ? { ...document, [key]: value } : document,
      ),
    }));
  };

  const handleSave = async () => {
    if (!currentSettings) {
      toast.error('Parametres indisponibles. Rechargez la page.');
      return;
    }

    setIsSaving(true);
    try {
      const latestSettings = await settings.get();
      const latestProfile = isRecord(latestSettings.municipalityProfile)
        ? latestSettings.municipalityProfile
        : {};
      const latestVieQuotidienne = isRecord(latestProfile.vieQuotidienne)
        ? latestProfile.vieQuotidienne
        : {};
      const sanitized = sanitizeRestauration(form);

      const updatedProfile: JsonRecord = {
        ...latestProfile,
        vieQuotidienne: {
          ...latestVieQuotidienne,
          restaurationScolaire: sanitized,
        },
      };

      await settings.update({
        municipalityProfile: updatedProfile,
      });

      setCurrentSettings({
        ...latestSettings,
        municipalityProfile: updatedProfile,
      });
      setForm(sanitized);
      toast.success('Restauration scolaire enregistree');
    } catch (error) {
      console.error('Failed to save restauration scolaire:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Restauration scolaire</CardTitle>
          <CardDescription>
            Impossible de charger les parametres. Verifiez la disponibilite de l&apos;API settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadSettings}>Reessayer</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restauration scolaire</h1>
          <p className="text-muted-foreground">
            Edition du menu hebdomadaire et des contenus publics cantine.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>En-tete de page</CardTitle>
          <CardDescription>Titre et introduction de la page publique.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={form.title || ''}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Restauration scolaire"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="intro">Introduction</Label>
            <Textarea
              id="intro"
              value={form.intro || ''}
              onChange={(event) => updateField('intro', event.target.value)}
              rows={4}
              placeholder="Presentation de la restauration scolaire"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-orange-500" />
            Menu hebdomadaire courant
          </CardTitle>
          <CardDescription>
            Publiez le menu actuel en texte, image, PDF ou mixte. Les champs URL/mediaId sont optionnels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label>Semaine</Label>
              <Input
                value={form.menuCourant?.weekLabel || ''}
                onChange={(event) => updateMenu('weekLabel', event.target.value)}
                placeholder="Semaine du 2 au 6 septembre"
              />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.menuCourant?.format || 'TEXT'}
                onChange={(event) => updateMenu('format', event.target.value as RestaurationScolaireMenuFormat)}
              >
                {MENU_FORMAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Valide du</Label>
              <Input
                type="date"
                value={form.menuCourant?.validFrom || ''}
                onChange={(event) => updateMenu('validFrom', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Valide au</Label>
              <Input
                type="date"
                value={form.menuCourant?.validTo || ''}
                onChange={(event) => updateMenu('validTo', event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Contenu texte du menu</Label>
            <Textarea
              value={form.menuCourant?.textContent || ''}
              onChange={(event) => updateMenu('textContent', event.target.value)}
              rows={8}
              placeholder="Lundi: ...\nMardi: ..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Image URL (optionnel)</Label>
              <Input
                value={form.menuCourant?.imageUrl || ''}
                onChange={(event) => updateMenu('imageUrl', event.target.value)}
                placeholder="https://.../menu.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label>Image mediaId (optionnel)</Label>
              <Input
                value={form.menuCourant?.imageMediaId || ''}
                onChange={(event) => updateMenu('imageMediaId', event.target.value)}
                placeholder="media-id"
              />
            </div>
            <div className="space-y-2">
              <Label>PDF URL (optionnel)</Label>
              <Input
                value={form.menuCourant?.pdfUrl || ''}
                onChange={(event) => updateMenu('pdfUrl', event.target.value)}
                placeholder="https://.../menu.pdf"
              />
            </div>
            <div className="space-y-2">
              <Label>PDF mediaId (optionnel)</Label>
              <Input
                value={form.menuCourant?.pdfMediaId || ''}
                onChange={(event) => updateMenu('pdfMediaId', event.target.value)}
                placeholder="media-id"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tarifs</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.tarifs || ''}
              onChange={(event) => updateField('tarifs', event.target.value)}
              rows={8}
              placeholder="Tarifs publics"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.inscription || ''}
              onChange={(event) => updateField('inscription', event.target.value)}
              rows={8}
              placeholder="Modalites d'inscription"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allergies</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.allergies || ''}
              onChange={(event) => updateField('allergies', event.target.value)}
              rows={8}
              placeholder="Infos PAI, allergies, regimes"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagements</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.engagements || ''}
              onChange={(event) => updateField('engagements', event.target.value)}
              rows={8}
              placeholder="Produits locaux, qualite, etc."
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
          <CardDescription>Documents additionnels (URL ou mediaId).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(form.documents || []).map((document, index) => (
            <div key={`document-${index}`} className="space-y-3 rounded-lg border p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input
                    value={document.title}
                    onChange={(event) => updateDocument(index, 'title', event.target.value)}
                    placeholder="Titre"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={document.description || ''}
                    onChange={(event) => updateDocument(index, 'description', event.target.value)}
                    placeholder="Description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>mediaId</Label>
                  <Input
                    value={document.mediaId || ''}
                    onChange={(event) => updateDocument(index, 'mediaId', event.target.value)}
                    placeholder="media-id"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={document.url || ''}
                    onChange={(event) => updateDocument(index, 'url', event.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  updateField(
                    'documents',
                    (form.documents || []).filter((_, currentIndex) => currentIndex !== index),
                  )
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Retirer ce document
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => updateField('documents', [...(form.documents || []), createDocument()])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un document
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
