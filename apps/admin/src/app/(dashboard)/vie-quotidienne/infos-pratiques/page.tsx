'use client';

import * as React from 'react';
import {
  AlertTriangle,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  settings,
  type InfosPratiquesContent,
  type InfosPratiquesDocument,
  type InfosPratiquesEmergencyNumber,
  type InfosPratiquesLocalRule,
  type InfosPratiquesUsefulLink,
  type InfosPratiquesWasteItem,
  type Settings,
} from '@/lib/api';
import { toast } from 'sonner';

type JsonRecord = Record<string, unknown>;

const createEmergencyNumber = (): InfosPratiquesEmergencyNumber => ({
  label: '',
  value: '',
  description: '',
  priority: 0,
});

const createWasteItem = (): InfosPratiquesWasteItem => ({
  title: '',
  description: '',
  schedule: '',
  location: '',
  linkLabel: '',
  linkUrl: '',
  priority: 0,
});

const createLocalRule = (): InfosPratiquesLocalRule => ({
  title: '',
  description: '',
  priority: 0,
});

const createUsefulLink = (): InfosPratiquesUsefulLink => ({
  label: '',
  url: '',
  description: '',
  priority: 0,
});

const createDocument = (): InfosPratiquesDocument => ({
  title: '',
  description: '',
  mediaId: '',
  url: '',
  priority: 0,
});

const createEmptyContent = (): InfosPratiquesContent => ({
  title: '',
  intro: '',
  emergencyNumbers: [],
  waste: [],
  localRules: [],
  usefulLinks: [],
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

function normalizeInfosPratiques(value: unknown): InfosPratiquesContent {
  if (!isRecord(value)) {
    return createEmptyContent();
  }

  const emergencyNumbers = Array.isArray(value.emergencyNumbers)
    ? value.emergencyNumbers
      .filter(isRecord)
      .map((item) => ({
        label: toOptionalString(item.label) || '',
        value: toOptionalString(item.value) || '',
        description: toOptionalString(item.description),
        priority: toOptionalNumber(item.priority),
      }))
    : [];

  const waste = Array.isArray(value.waste)
    ? value.waste
      .filter(isRecord)
      .map((item) => ({
        title: toOptionalString(item.title) || '',
        description: toOptionalString(item.description),
        schedule: toOptionalString(item.schedule),
        location: toOptionalString(item.location),
        linkLabel: toOptionalString(item.linkLabel),
        linkUrl: toOptionalString(item.linkUrl),
        priority: toOptionalNumber(item.priority),
      }))
    : [];

  const localRules = Array.isArray(value.localRules)
    ? value.localRules
      .filter(isRecord)
      .map((item) => ({
        title: toOptionalString(item.title) || '',
        description: toOptionalString(item.description) || '',
        priority: toOptionalNumber(item.priority),
      }))
    : [];

  const usefulLinks = Array.isArray(value.usefulLinks)
    ? value.usefulLinks
      .filter(isRecord)
      .map((item) => ({
        label: toOptionalString(item.label) || '',
        url: toOptionalString(item.url) || '',
        description: toOptionalString(item.description),
        priority: toOptionalNumber(item.priority),
      }))
    : [];

  const documents = Array.isArray(value.documents)
    ? value.documents
      .filter(isRecord)
      .map((item) => ({
        title: toOptionalString(item.title) || '',
        description: toOptionalString(item.description),
        mediaId: toOptionalString(item.mediaId),
        url: toOptionalString(item.url),
        priority: toOptionalNumber(item.priority),
      }))
    : [];

  return {
    title: toOptionalString(value.title) || '',
    intro: toOptionalString(value.intro) || '',
    emergencyNumbers,
    waste,
    localRules,
    usefulLinks,
    documents,
    updatedAt: toOptionalString(value.updatedAt),
  };
}

function sanitizeInfosPratiques(content: InfosPratiquesContent): InfosPratiquesContent {
  const emergencyNumbers = (content.emergencyNumbers || [])
    .map((item) => ({
      label: item.label.trim(),
      value: item.value.trim(),
      description: toOptionalString(item.description),
      priority: item.priority,
    }))
    .filter((item) => item.label.length > 0 && item.value.length > 0);

  const waste = (content.waste || [])
    .map((item) => ({
      title: item.title.trim(),
      description: toOptionalString(item.description),
      schedule: toOptionalString(item.schedule),
      location: toOptionalString(item.location),
      linkLabel: toOptionalString(item.linkLabel),
      linkUrl: toOptionalString(item.linkUrl),
      priority: item.priority,
    }))
    .filter((item) => item.title.length > 0);

  const localRules = (content.localRules || [])
    .map((item) => ({
      title: item.title.trim(),
      description: item.description.trim(),
      priority: item.priority,
    }))
    .filter((item) => item.title.length > 0 && item.description.length > 0);

  const usefulLinks = (content.usefulLinks || [])
    .map((item) => ({
      label: item.label.trim(),
      url: item.url.trim(),
      description: toOptionalString(item.description),
      priority: item.priority,
    }))
    .filter((item) => item.label.length > 0 && item.url.length > 0);

  const documents = (content.documents || [])
    .map((item) => ({
      title: item.title.trim(),
      description: toOptionalString(item.description),
      mediaId: toOptionalString(item.mediaId),
      url: toOptionalString(item.url),
      priority: item.priority,
    }))
    .filter((item) => item.title.length > 0);

  return {
    title: content.title?.trim(),
    intro: content.intro?.trim(),
    emergencyNumbers,
    waste,
    localRules,
    usefulLinks,
    documents,
    updatedAt: new Date().toISOString(),
  };
}

function readInfosPratiquesFromSettings(data: Settings): InfosPratiquesContent {
  const profile = isRecord(data.municipalityProfile) ? data.municipalityProfile : undefined;
  const vieQuotidienne = profile && isRecord(profile.vieQuotidienne) ? profile.vieQuotidienne : undefined;
  return normalizeInfosPratiques(vieQuotidienne?.infosPratiques);
}

export default function InfosPratiquesPage() {
  const [currentSettings, setCurrentSettings] = React.useState<Settings | null>(null);
  const [form, setForm] = React.useState<InfosPratiquesContent>(createEmptyContent());
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);

  const loadSettings = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const data = await settings.get();
      setCurrentSettings(data);
      setForm(readInfosPratiquesFromSettings(data));
    } catch (error) {
      console.error('Failed to load infos pratiques settings:', error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateField = <K extends keyof InfosPratiquesContent>(
    key: K,
    value: InfosPratiquesContent[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateEmergency = <K extends keyof InfosPratiquesEmergencyNumber>(
    index: number,
    key: K,
    value: InfosPratiquesEmergencyNumber[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      emergencyNumbers: (prev.emergencyNumbers || []).map((item, currentIndex) =>
        currentIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateWaste = <K extends keyof InfosPratiquesWasteItem>(
    index: number,
    key: K,
    value: InfosPratiquesWasteItem[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      waste: (prev.waste || []).map((item, currentIndex) =>
        currentIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateRule = <K extends keyof InfosPratiquesLocalRule>(
    index: number,
    key: K,
    value: InfosPratiquesLocalRule[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      localRules: (prev.localRules || []).map((item, currentIndex) =>
        currentIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateUsefulLink = <K extends keyof InfosPratiquesUsefulLink>(
    index: number,
    key: K,
    value: InfosPratiquesUsefulLink[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      usefulLinks: (prev.usefulLinks || []).map((item, currentIndex) =>
        currentIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateDocument = <K extends keyof InfosPratiquesDocument>(
    index: number,
    key: K,
    value: InfosPratiquesDocument[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      documents: (prev.documents || []).map((item, currentIndex) =>
        currentIndex === index ? { ...item, [key]: value } : item,
      ),
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
      const sanitized = sanitizeInfosPratiques(form);

      const updatedProfile: JsonRecord = {
        ...latestProfile,
        vieQuotidienne: {
          ...latestVieQuotidienne,
          infosPratiques: sanitized,
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
      toast.success('Infos pratiques enregistrees');
    } catch (error) {
      console.error('Failed to save infos pratiques:', error);
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
          <CardTitle>Infos pratiques</CardTitle>
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
          <h1 className="text-3xl font-bold tracking-tight">Infos pratiques</h1>
          <p className="text-muted-foreground">
            Edition du contenu public de la page Vie quotidienne / Infos pratiques.
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
          <CardDescription>
            Titre et introduction affiches en haut de la page publique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={form.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Infos pratiques"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="intro">Introduction</Label>
            <Textarea
              id="intro"
              value={form.intro || ''}
              onChange={(e) => updateField('intro', e.target.value)}
              rows={4}
              placeholder="Texte introductif de la page"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Numeros d&apos;urgence
          </CardTitle>
          <CardDescription>Liste publique des contacts d&apos;urgence.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(form.emergencyNumbers || []).map((item, index) => (
            <div key={`emergency-${index}`} className="space-y-3 rounded-lg border p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Libelle</Label>
                  <Input
                    value={item.label}
                    onChange={(e) => updateEmergency(index, 'label', e.target.value)}
                    placeholder="SAMU"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Numero</Label>
                  <Input
                    value={item.value}
                    onChange={(e) => updateEmergency(index, 'value', e.target.value)}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priorite</Label>
                  <Input
                    type="number"
                    value={item.priority ?? ''}
                    onChange={(e) => updateEmergency(index, 'priority', toPriorityValue(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={item.description || ''}
                  onChange={(e) => updateEmergency(index, 'description', e.target.value)}
                  placeholder="Urgence medicale"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  updateField(
                    'emergencyNumbers',
                    (form.emergencyNumbers || []).filter((_, currentIndex) => currentIndex !== index),
                  )
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => updateField('emergencyNumbers', [...(form.emergencyNumbers || []), createEmergencyNumber()])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un numero
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collecte et infos dechets</CardTitle>
          <CardDescription>
            Elements publics sur collecte, horaires, points de depot et liens externes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(form.waste || []).map((item, index) => (
            <div key={`waste-${index}`} className="space-y-3 rounded-lg border p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateWaste(index, 'title', e.target.value)}
                    placeholder="Tri selectif"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priorite</Label>
                  <Input
                    type="number"
                    value={item.priority ?? ''}
                    onChange={(e) => updateWaste(index, 'priority', toPriorityValue(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={item.description || ''}
                  onChange={(e) => updateWaste(index, 'description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Horaire / frequence</Label>
                  <Input
                    value={item.schedule || ''}
                    onChange={(e) => updateWaste(index, 'schedule', e.target.value)}
                    placeholder="Mardi et vendredi matin"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lieu</Label>
                  <Input
                    value={item.location || ''}
                    onChange={(e) => updateWaste(index, 'location', e.target.value)}
                    placeholder="Rue des Marais, Meriel"
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Libelle lien</Label>
                  <Input
                    value={item.linkLabel || ''}
                    onChange={(e) => updateWaste(index, 'linkLabel', e.target.value)}
                    placeholder="Voir horaires"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL lien</Label>
                  <Input
                    value={item.linkUrl || ''}
                    onChange={(e) => updateWaste(index, 'linkUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  updateField('waste', (form.waste || []).filter((_, currentIndex) => currentIndex !== index))
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={() => updateField('waste', [...(form.waste || []), createWasteItem()])}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une ligne dechets
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regles locales</CardTitle>
          <CardDescription>Regles et notices de vie quotidienne a afficher publiquement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(form.localRules || []).map((item, index) => (
            <div key={`rule-${index}`} className="space-y-3 rounded-lg border p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateRule(index, 'title', e.target.value)}
                    placeholder="Bruits de voisinage"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priorite</Label>
                  <Input
                    type="number"
                    value={item.priority ?? ''}
                    onChange={(e) => updateRule(index, 'priority', toPriorityValue(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) => updateRule(index, 'description', e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  updateField(
                    'localRules',
                    (form.localRules || []).filter((_, currentIndex) => currentIndex !== index),
                  )
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => updateField('localRules', [...(form.localRules || []), createLocalRule()])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une regle
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Liens utiles
          </CardTitle>
          <CardDescription>Liens externes utilises dans la page publique.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(form.usefulLinks || []).map((item, index) => (
            <div key={`link-${index}`} className="space-y-3 rounded-lg border p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Libelle</Label>
                  <Input
                    value={item.label}
                    onChange={(e) => updateUsefulLink(index, 'label', e.target.value)}
                    placeholder="Service-Public.fr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priorite</Label>
                  <Input
                    type="number"
                    value={item.priority ?? ''}
                    onChange={(e) => updateUsefulLink(index, 'priority', toPriorityValue(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={item.url}
                  onChange={(e) => updateUsefulLink(index, 'url', e.target.value)}
                  placeholder="https://www.service-public.fr"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={item.description || ''}
                  onChange={(e) => updateUsefulLink(index, 'description', e.target.value)}
                  placeholder="Demarches administratives nationales"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  updateField(
                    'usefulLinks',
                    (form.usefulLinks || []).filter((_, currentIndex) => currentIndex !== index),
                  )
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => updateField('usefulLinks', [...(form.usefulLinks || []), createUsefulLink()])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un lien
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents utiles
          </CardTitle>
          <CardDescription>
            Metadata documents (titre, description, URL, mediaId). Integration media picker a faire dans un prompt suivant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(form.documents || []).map((item, index) => (
            <div key={`document-${index}`} className="space-y-3 rounded-lg border p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateDocument(index, 'title', e.target.value)}
                    placeholder="Reglement communal"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priorite</Label>
                  <Input
                    type="number"
                    value={item.priority ?? ''}
                    onChange={(e) => updateDocument(index, 'priority', toPriorityValue(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={item.description || ''}
                  onChange={(e) => updateDocument(index, 'description', e.target.value)}
                  placeholder="Description courte"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>URL document</Label>
                  <Input
                    value={item.url || ''}
                    onChange={(e) => updateDocument(index, 'url', e.target.value)}
                    placeholder="https://.../document.pdf"
                  />
                </div>
                <div className="space-y-2">
                  <Label>mediaId (optionnel)</Label>
                  <Input
                    value={item.mediaId || ''}
                    onChange={(e) => updateDocument(index, 'mediaId', e.target.value)}
                    placeholder="cm123..."
                  />
                </div>
              </div>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ouvrir le document
                </a>
              ) : null}
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
                Supprimer
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={() => updateField('documents', [...(form.documents || []), createDocument()])}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un document
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
