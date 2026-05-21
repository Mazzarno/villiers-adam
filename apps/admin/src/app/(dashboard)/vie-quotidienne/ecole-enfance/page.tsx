'use client';

import * as React from 'react';
import { FileText, Link as LinkIcon, Loader2, Plus, Save, School, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  settings,
  type EcoleEnfanceContent,
  type EcoleEnfanceDocument,
  type EcoleEnfanceLink,
  type EcoleEnfanceSchoolContact,
  type EcoleEnfanceSection,
  type Settings,
} from '@/lib/api';
import { toast } from 'sonner';

type JsonRecord = Record<string, unknown>;

const SECTION_KEY_SUGGESTIONS = [
  'petite-enfance',
  'ecole-primaire',
  'centre-de-loisirs',
  'college-lycee',
  'recensement',
  'transport-scolaire',
] as const;

const createSchoolContact = (): EcoleEnfanceSchoolContact => ({
  name: '',
  address: '',
  phone: '',
  email: '',
  director: '',
});

const createLink = (): EcoleEnfanceLink => ({
  label: '',
  url: '',
});

const createDocument = (): EcoleEnfanceDocument => ({
  title: '',
  description: '',
  mediaId: '',
  url: '',
});

const createSection = (): EcoleEnfanceSection => ({
  key: '',
  title: '',
  description: '',
  content: '',
  links: [],
  documents: [],
  priority: 0,
});

const createEmptyContent = (): EcoleEnfanceContent => ({
  title: '',
  intro: '',
  schoolContact: createSchoolContact(),
  sections: [],
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

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function normalizeSectionKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function normalizeEcoleEnfance(value: unknown): EcoleEnfanceContent {
  if (!isRecord(value)) {
    return createEmptyContent();
  }

  const schoolContact = isRecord(value.schoolContact)
    ? {
      name: toOptionalString(value.schoolContact.name) || '',
      address: toOptionalString(value.schoolContact.address) || '',
      phone: toOptionalString(value.schoolContact.phone) || '',
      email: toOptionalString(value.schoolContact.email) || '',
      director: toOptionalString(value.schoolContact.director) || '',
    }
    : createSchoolContact();

  const sections = Array.isArray(value.sections)
    ? value.sections
      .filter(isRecord)
      .map((section) => ({
        key: toOptionalString(section.key) || '',
        title: toOptionalString(section.title) || '',
        description: toOptionalString(section.description),
        content: toOptionalString(section.content),
        priority: toOptionalNumber(section.priority),
        links: Array.isArray(section.links)
          ? section.links
            .filter(isRecord)
            .map((link) => ({
              label: toOptionalString(link.label) || '',
              url: toOptionalString(link.url) || '',
            }))
          : [],
        documents: Array.isArray(section.documents)
          ? section.documents
            .filter(isRecord)
            .map((document) => ({
              title: toOptionalString(document.title) || '',
              description: toOptionalString(document.description),
              mediaId: toOptionalString(document.mediaId),
              url: toOptionalString(document.url),
            }))
          : [],
      }))
    : [];

  return {
    title: toOptionalString(value.title) || '',
    intro: toOptionalString(value.intro) || '',
    schoolContact,
    sections,
    updatedAt: toOptionalString(value.updatedAt),
  };
}

function sanitizeEcoleEnfance(content: EcoleEnfanceContent): EcoleEnfanceContent {
  const schoolContact = {
    name: toOptionalString(content.schoolContact?.name),
    address: toOptionalString(content.schoolContact?.address),
    phone: toOptionalString(content.schoolContact?.phone),
    email: toOptionalString(content.schoolContact?.email),
    director: toOptionalString(content.schoolContact?.director),
  };

  const hasSchoolContact = Object.values(schoolContact).some(Boolean);

  const sections = (content.sections || [])
    .map((section) => {
      const key = normalizeSectionKey(section.key || '');
      const title = section.title.trim();

      const links = (section.links || [])
        .map((link) => ({
          label: link.label.trim(),
          url: link.url.trim(),
        }))
        .filter((link) => link.label.length > 0 && link.url.length > 0);

      const documents = (section.documents || [])
        .map((document) => ({
          title: document.title.trim(),
          description: toOptionalString(document.description),
          mediaId: toOptionalString(document.mediaId),
          url: toOptionalString(document.url),
        }))
        .filter((document) => document.title.length > 0);

      return {
        key,
        title,
        description: toOptionalString(section.description),
        content: toOptionalString(section.content),
        links,
        documents,
        priority: section.priority,
      };
    })
    .filter((section) => section.key.length > 0 && section.title.length > 0);

  return {
    title: content.title?.trim(),
    intro: content.intro?.trim(),
    schoolContact: hasSchoolContact ? schoolContact : undefined,
    sections,
    updatedAt: new Date().toISOString(),
  };
}

function readEcoleEnfanceFromSettings(data: Settings): EcoleEnfanceContent {
  const profile = isRecord(data.municipalityProfile) ? data.municipalityProfile : undefined;
  const vieQuotidienne = profile && isRecord(profile.vieQuotidienne) ? profile.vieQuotidienne : undefined;
  return normalizeEcoleEnfance(vieQuotidienne?.ecoleEnfance);
}

export default function EcoleEnfancePage() {
  const [currentSettings, setCurrentSettings] = React.useState<Settings | null>(null);
  const [form, setForm] = React.useState<EcoleEnfanceContent>(createEmptyContent());
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);

  const loadSettings = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const data = await settings.get();
      setCurrentSettings(data);
      setForm(readEcoleEnfanceFromSettings(data));
    } catch (error) {
      console.error('Failed to load ecole enfance settings:', error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateField = <K extends keyof EcoleEnfanceContent>(
    key: K,
    value: EcoleEnfanceContent[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSchoolContact = <K extends keyof EcoleEnfanceSchoolContact>(
    key: K,
    value: EcoleEnfanceSchoolContact[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      schoolContact: {
        ...(prev.schoolContact || createSchoolContact()),
        [key]: value,
      },
    }));
  };

  const updateSection = <K extends keyof EcoleEnfanceSection>(
    index: number,
    key: K,
    value: EcoleEnfanceSection[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [key]: value } : section,
      ),
    }));
  };

  const updateSectionLink = <K extends keyof EcoleEnfanceLink>(
    sectionIndex: number,
    linkIndex: number,
    key: K,
    value: EcoleEnfanceLink[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((section, currentSectionIndex) => {
        if (currentSectionIndex !== sectionIndex) return section;
        return {
          ...section,
          links: (section.links || []).map((link, currentLinkIndex) =>
            currentLinkIndex === linkIndex ? { ...link, [key]: value } : link,
          ),
        };
      }),
    }));
  };

  const updateSectionDocument = <K extends keyof EcoleEnfanceDocument>(
    sectionIndex: number,
    documentIndex: number,
    key: K,
    value: EcoleEnfanceDocument[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((section, currentSectionIndex) => {
        if (currentSectionIndex !== sectionIndex) return section;
        return {
          ...section,
          documents: (section.documents || []).map((document, currentDocumentIndex) =>
            currentDocumentIndex === documentIndex ? { ...document, [key]: value } : document,
          ),
        };
      }),
    }));
  };

  const toPriorityValue = (value: string): number | undefined => {
    if (!value.trim()) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
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
      const sanitized = sanitizeEcoleEnfance(form);

      const updatedProfile: JsonRecord = {
        ...latestProfile,
        vieQuotidienne: {
          ...latestVieQuotidienne,
          ecoleEnfance: sanitized,
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
      toast.success('Ecole / enfance enregistre');
    } catch (error) {
      console.error('Failed to save ecole enfance:', error);
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
          <CardTitle>Ecole et enfance</CardTitle>
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
          <h1 className="text-3xl font-bold tracking-tight">Ecole et enfance</h1>
          <p className="text-muted-foreground">
            Edition du contenu public des pages Vie quotidienne / Ecole &amp; Enfance.
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
          <CardDescription>Titre et introduction de la page ecole.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={form.title || ''}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Ecole & enfance"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="intro">Introduction</Label>
            <Textarea
              id="intro"
              value={form.intro || ''}
              onChange={(event) => updateField('intro', event.target.value)}
              rows={4}
              placeholder="Texte d'introduction de la page"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-villiers-blue" />
            Contact ecole
          </CardTitle>
          <CardDescription>Coordonnees affichees sur les pages ecole.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              value={form.schoolContact?.name || ''}
              onChange={(event) => updateSchoolContact('name', event.target.value)}
              placeholder="Ecole elementaire"
            />
          </div>
          <div className="space-y-2">
            <Label>Direction</Label>
            <Input
              value={form.schoolContact?.director || ''}
              onChange={(event) => updateSchoolContact('director', event.target.value)}
              placeholder="Nom du directeur ou de la directrice"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Adresse</Label>
            <Textarea
              value={form.schoolContact?.address || ''}
              onChange={(event) => updateSchoolContact('address', event.target.value)}
              rows={2}
              placeholder="Adresse complete"
            />
          </div>
          <div className="space-y-2">
            <Label>Telephone</Label>
            <Input
              value={form.schoolContact?.phone || ''}
              onChange={(event) => updateSchoolContact('phone', event.target.value)}
              placeholder="01 23 45 67 89"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.schoolContact?.email || ''}
              onChange={(event) => updateSchoolContact('email', event.target.value)}
              placeholder="ecole@exemple.fr"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sections dynamiques</CardTitle>
          <CardDescription>
            Creez le contenu pour chaque sous-page (petite-enfance, ecole-primaire, centre-de-loisirs,
            college-lycee, recensement, transport-scolaire).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {(form.sections || []).map((section, sectionIndex) => (
            <div key={`section-${sectionIndex}`} className="space-y-4 rounded-lg border p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Cle section</Label>
                  <Input
                    value={section.key}
                    onChange={(event) => updateSection(sectionIndex, 'key', event.target.value)}
                    placeholder="petite-enfance"
                    list="ecole-section-keys"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Titre</Label>
                  <Input
                    value={section.title}
                    onChange={(event) => updateSection(sectionIndex, 'title', event.target.value)}
                    placeholder="Titre public"
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Description</Label>
                  <Textarea
                    value={section.description || ''}
                    onChange={(event) => updateSection(sectionIndex, 'description', event.target.value)}
                    rows={2}
                    placeholder="Resume court"
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Contenu</Label>
                  <Textarea
                    value={section.content || ''}
                    onChange={(event) => updateSection(sectionIndex, 'content', event.target.value)}
                    rows={6}
                    placeholder="Contenu principal de la section"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priorite</Label>
                  <Input
                    type="number"
                    value={section.priority ?? ''}
                    onChange={(event) => updateSection(sectionIndex, 'priority', toPriorityValue(event.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-md border border-dashed p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Liens
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSection(sectionIndex, 'links', [...(section.links || []), createLink()])
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un lien
                  </Button>
                </div>

                {(section.links || []).map((link, linkIndex) => (
                  <div key={`link-${sectionIndex}-${linkIndex}`} className="grid gap-3 md:grid-cols-2">
                    <Input
                      value={link.label}
                      onChange={(event) =>
                        updateSectionLink(sectionIndex, linkIndex, 'label', event.target.value)
                      }
                      placeholder="Libelle"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={link.url}
                        onChange={(event) =>
                          updateSectionLink(sectionIndex, linkIndex, 'url', event.target.value)
                        }
                        placeholder="https://..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateSection(
                            sectionIndex,
                            'links',
                            (section.links || []).filter((_, currentIndex) => currentIndex !== linkIndex),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-md border border-dashed p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSection(sectionIndex, 'documents', [...(section.documents || []), createDocument()])
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un document
                  </Button>
                </div>

                {(section.documents || []).map((document, documentIndex) => (
                  <div key={`document-${sectionIndex}-${documentIndex}`} className="space-y-3 rounded border p-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        value={document.title}
                        onChange={(event) =>
                          updateSectionDocument(sectionIndex, documentIndex, 'title', event.target.value)
                        }
                        placeholder="Titre"
                      />
                      <Input
                        value={document.description || ''}
                        onChange={(event) =>
                          updateSectionDocument(sectionIndex, documentIndex, 'description', event.target.value)
                        }
                        placeholder="Description"
                      />
                      <Input
                        value={document.mediaId || ''}
                        onChange={(event) =>
                          updateSectionDocument(sectionIndex, documentIndex, 'mediaId', event.target.value)
                        }
                        placeholder="mediaId (optionnel)"
                      />
                      <Input
                        value={document.url || ''}
                        onChange={(event) =>
                          updateSectionDocument(sectionIndex, documentIndex, 'url', event.target.value)
                        }
                        placeholder="URL document (optionnel)"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateSection(
                          sectionIndex,
                          'documents',
                          (section.documents || []).filter(
                            (_, currentIndex) => currentIndex !== documentIndex,
                          ),
                        )
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Retirer ce document
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  updateField(
                    'sections',
                    (form.sections || []).filter((_, currentIndex) => currentIndex !== sectionIndex),
                  )
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Retirer cette section
              </Button>
            </div>
          ))}

          <datalist id="ecole-section-keys">
            {SECTION_KEY_SUGGESTIONS.map((key) => (
              <option key={key} value={key} />
            ))}
          </datalist>

          <Button
            type="button"
            variant="outline"
            onClick={() => updateField('sections', [...(form.sections || []), createSection()])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une section
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
