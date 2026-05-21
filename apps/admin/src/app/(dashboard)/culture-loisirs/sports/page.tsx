'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Dumbbell,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  annuaire,
  municipalServices,
  settings,
  type DirectoryEntry,
  type MunicipalService,
  type Settings,
  type SportsContent,
  type SportsDocument,
  type SportsHighlight,
  type SportsUsefulLink,
} from '@/lib/api';
import { toast } from 'sonner';

type JsonRecord = Record<string, unknown>;

const SPORTS_SERVICE_CATEGORY = 'SPORT';

const createHighlight = (): SportsHighlight => ({
  title: '',
  description: '',
  priority: 0,
});

const createUsefulLink = (): SportsUsefulLink => ({
  label: '',
  url: '',
  description: '',
  priority: 0,
});

const createDocument = (): SportsDocument => ({
  title: '',
  description: '',
  mediaId: '',
  url: '',
  priority: 0,
});

const createEmptyContent = (): SportsContent => ({
  title: '',
  intro: '',
  description: '',
  equipmentTitle: '',
  associationsTitle: '',
  associationIds: [],
  highlights: [],
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

function normalizeAssociationIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const ids: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    ids.push(trimmed);
  }

  return ids;
}

function normalizeSports(value: unknown): SportsContent {
  if (!isRecord(value)) {
    return createEmptyContent();
  }

  const highlights = Array.isArray(value.highlights)
    ? value.highlights
      .filter(isRecord)
      .map((item) => ({
        title: toOptionalString(item.title) || '',
        description: toOptionalString(item.description),
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
    description: toOptionalString(value.description) || '',
    equipmentTitle: toOptionalString(value.equipmentTitle) || '',
    associationsTitle: toOptionalString(value.associationsTitle) || '',
    associationIds: normalizeAssociationIds(value.associationIds),
    highlights,
    usefulLinks,
    documents,
    updatedAt: toOptionalString(value.updatedAt),
  };
}

function sanitizeSports(content: SportsContent): SportsContent {
  const associationIds = normalizeAssociationIds(content.associationIds || []);

  const highlights = (content.highlights || [])
    .map((item) => ({
      title: item.title.trim(),
      description: toOptionalString(item.description),
      priority: item.priority,
    }))
    .filter((item) => item.title.length > 0);

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
    title: toOptionalString(content.title),
    intro: toOptionalString(content.intro),
    description: toOptionalString(content.description),
    equipmentTitle: toOptionalString(content.equipmentTitle),
    associationsTitle: toOptionalString(content.associationsTitle),
    associationIds,
    highlights,
    usefulLinks,
    documents,
    updatedAt: new Date().toISOString(),
  };
}

function readSportsFromSettings(data: Settings): SportsContent {
  const profile = isRecord(data.municipalityProfile) ? data.municipalityProfile : undefined;
  const cultureLoisirs = profile && isRecord(profile.cultureLoisirs) ? profile.cultureLoisirs : undefined;
  return normalizeSports(cultureLoisirs?.sports);
}

export default function SportsPage() {
  const [currentSettings, setCurrentSettings] = React.useState<Settings | null>(null);
  const [form, setForm] = React.useState<SportsContent>(createEmptyContent());
  const [associations, setAssociations] = React.useState<DirectoryEntry[]>([]);
  const [sportsServices, setSportsServices] = React.useState<MunicipalService[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [settingsError, setSettingsError] = React.useState(false);
  const [associationsError, setAssociationsError] = React.useState(false);
  const [servicesError, setServicesError] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setSettingsError(false);
    setAssociationsError(false);
    setServicesError(false);

    const [settingsResult, servicesResult, associationsResult] = await Promise.allSettled([
      settings.get(),
      municipalServices.list({ category: SPORTS_SERVICE_CATEGORY }),
      annuaire.list({ type: 'ASSOCIATION' }),
    ]);

    if (settingsResult.status === 'fulfilled') {
      setCurrentSettings(settingsResult.value);
      setForm(readSportsFromSettings(settingsResult.value));
    } else {
      console.error('Failed to load sports settings:', settingsResult.reason);
      setSettingsError(true);
      setCurrentSettings(null);
      setForm(createEmptyContent());
    }

    if (servicesResult.status === 'fulfilled') {
      setSportsServices(servicesResult.value);
    } else {
      console.error('Failed to load sports services:', servicesResult.reason);
      setServicesError(true);
      setSportsServices([]);
    }

    if (associationsResult.status === 'fulfilled') {
      setAssociations(associationsResult.value);
    } else {
      console.error('Failed to load directory associations:', associationsResult.reason);
      setAssociationsError(true);
      setAssociations([]);
    }

    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const updateField = <K extends keyof SportsContent>(key: K, value: SportsContent[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateHighlight = <K extends keyof SportsHighlight>(
    index: number,
    key: K,
    value: SportsHighlight[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      highlights: (prev.highlights || []).map((item, currentIndex) =>
        currentIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateUsefulLink = <K extends keyof SportsUsefulLink>(
    index: number,
    key: K,
    value: SportsUsefulLink[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      usefulLinks: (prev.usefulLinks || []).map((item, currentIndex) =>
        currentIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateDocument = <K extends keyof SportsDocument>(
    index: number,
    key: K,
    value: SportsDocument[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      documents: (prev.documents || []).map((item, currentIndex) =>
        currentIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const toggleAssociation = (associationId: string) => {
    setForm((prev) => {
      const selected = prev.associationIds || [];
      const exists = selected.includes(associationId);
      return {
        ...prev,
        associationIds: exists
          ? selected.filter((id) => id !== associationId)
          : [...selected, associationId],
      };
    });
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
      const latestCultureLoisirs = isRecord(latestProfile.cultureLoisirs)
        ? latestProfile.cultureLoisirs
        : {};
      const sanitized = sanitizeSports(form);

      const updatedProfile: JsonRecord = {
        ...latestProfile,
        cultureLoisirs: {
          ...latestCultureLoisirs,
          sports: sanitized,
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
      toast.success('Sports enregistres');
    } catch (error) {
      console.error('Failed to save sports settings:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedAssociationIds = React.useMemo(
    () => form.associationIds || [],
    [form.associationIds],
  );
  const selectedAssociationSet = React.useMemo(
    () => new Set(selectedAssociationIds),
    [selectedAssociationIds],
  );

  const selectedAssociations = React.useMemo(
    () => selectedAssociationIds
      .map((id) => associations.find((association) => association.id === id))
      .filter((association): association is DirectoryEntry => Boolean(association)),
    [associations, selectedAssociationIds],
  );

  const missingAssociationIds = React.useMemo(
    () => selectedAssociationIds.filter((id) => !associations.some((association) => association.id === id)),
    [associations, selectedAssociationIds],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (settingsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sports</CardTitle>
          <CardDescription>
            Impossible de charger les parametres. Verifiez la disponibilite de l&apos;API settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadData}>Reessayer</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sports</h1>
          <p className="text-muted-foreground">
            Edition du contenu public sports et selection explicite des associations.
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
            Titres et textes editoriaux de la page publique sports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={form.title || ''}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Sports"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intro">Introduction</Label>
            <Textarea
              id="intro"
              value={form.intro || ''}
              onChange={(event) => updateField('intro', event.target.value)}
              rows={4}
              placeholder="Presentation generale des activites sportives"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description complementaire</Label>
            <Textarea
              id="description"
              value={form.description || ''}
              onChange={(event) => updateField('description', event.target.value)}
              rows={4}
              placeholder="Texte complementaire affiche sous l'introduction"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Titres de sections</CardTitle>
            <CardDescription>
              Personnalisez les libelles des blocs equipements et associations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="equipmentTitle">Titre equipements</Label>
              <Input
                id="equipmentTitle"
                value={form.equipmentTitle || ''}
                onChange={(event) => updateField('equipmentTitle', event.target.value)}
                placeholder="Equipements sportifs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="associationsTitle">Titre associations</Label>
              <Input
                id="associationsTitle"
                value={form.associationsTitle || ''}
                onChange={(event) => updateField('associationsTitle', event.target.value)}
                placeholder="Associations sportives"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-green-500" />
              Equipements API (categorie SPORT)
            </CardTitle>
            <CardDescription>
              Liste issue uniquement de MunicipalService avec categorie exacte {SPORTS_SERVICE_CATEGORY}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {servicesError && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
                Les equipements sont temporairement indisponibles (API services).
              </div>
            )}

            {!servicesError && sportsServices.length === 0 && (
              <div className="rounded-md border border-border/60 p-4 text-sm text-muted-foreground">
                Aucun service publie avec categorie {SPORTS_SERVICE_CATEGORY}.
              </div>
            )}

            {!servicesError && sportsServices.length > 0 && (
              <div className="space-y-2">
                {sportsServices.map((service) => (
                  <div key={service.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{service.name}</p>
                        {service.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                        )}
                      </div>
                      <Badge
                        variant={service.status === 'PUBLISHED' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {service.status === 'PUBLISHED' ? 'Publie' : service.status === 'DRAFT' ? 'Brouillon' : service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button variant="outline" asChild>
              <Link href="/mairie/services?category=SPORT">Gerer les services SPORT</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            Associations sportives selectionnees
          </CardTitle>
          <CardDescription>
            Selection explicite par identifiants. Aucun filtrage texte n&apos;est utilise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {associationsError && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
              Les associations sont temporairement indisponibles (API annuaire).
            </div>
          )}

          {!associationsError && associations.length === 0 && (
            <div className="rounded-md border border-border/60 p-4 text-sm text-muted-foreground">
              Aucune association disponible dans l&apos;annuaire.
            </div>
          )}

          {!associationsError && associations.length > 0 && (
            <>
              <div className="rounded-md border border-border/60 p-3 text-sm text-muted-foreground">
                {selectedAssociationIds.length} association(s) selectionnee(s).
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {associations.map((association) => {
                  const isSelected = selectedAssociationSet.has(association.id);
                  return (
                    <button
                      key={association.id}
                      type="button"
                      onClick={() => toggleAssociation(association.id)}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border/60 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{association.name}</p>
                          {association.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{association.description}</p>
                          )}
                        </div>
                        <Badge
                          variant={association.status === 'PUBLISHED' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {association.status === 'PUBLISHED' ? 'Publie' : association.status === 'DRAFT' ? 'Brouillon' : association.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">ID: {association.id}</p>
                    </button>
                  );
                })}
              </div>

              {selectedAssociations.length > 0 && (
                <div className="rounded-md border border-border/60 p-4 space-y-2">
                  <p className="text-sm font-medium">Selection actuelle</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {selectedAssociations.map((association) => (
                      <li key={association.id}>- {association.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {missingAssociationIds.length > 0 && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <p>Certaines associations selectionnees ne sont plus trouvees dans l&apos;annuaire admin:</p>
                      <ul className="mt-2 space-y-1">
                        {missingAssociationIds.map((id) => (
                          <li key={id}>- {id}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <Button variant="outline" asChild>
            <Link href="/annuaire">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ouvrir l&apos;annuaire
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Points forts</CardTitle>
          <CardDescription>Blocs editoriaux optionnels affiches sur la page sports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(form.highlights || []).map((item, index) => (
            <div key={`highlight-${index}`} className="rounded-lg border p-4 space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input
                    value={item.title}
                    onChange={(event) => updateHighlight(index, 'title', event.target.value)}
                    placeholder="Nom du point fort"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priorite</Label>
                  <Input
                    type="number"
                    value={item.priority ?? ''}
                    onChange={(event) => updateHighlight(index, 'priority', toPriorityValue(event.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={item.description || ''}
                  onChange={(event) => updateHighlight(index, 'description', event.target.value)}
                  placeholder="Description"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  updateField(
                    'highlights',
                    (form.highlights || []).filter((_, currentIndex) => currentIndex !== index),
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
            variant="outline"
            onClick={() => updateField('highlights', [...(form.highlights || []), createHighlight()])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un point fort
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liens utiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(form.usefulLinks || []).map((item, index) => (
            <div key={`link-${index}`} className="rounded-lg border p-4 space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Libelle</Label>
                  <Input
                    value={item.label}
                    onChange={(event) => updateUsefulLink(index, 'label', event.target.value)}
                    placeholder="Label"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priorite</Label>
                  <Input
                    type="number"
                    value={item.priority ?? ''}
                    onChange={(event) => updateUsefulLink(index, 'priority', toPriorityValue(event.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={item.url}
                  onChange={(event) => updateUsefulLink(index, 'url', event.target.value)}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={item.description || ''}
                  onChange={(event) => updateUsefulLink(index, 'description', event.target.value)}
                  placeholder="Description optionnelle"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
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
            variant="outline"
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
            <FileText className="h-5 w-5 text-villiers-blue" />
            Documents
          </CardTitle>
          <CardDescription>
            Metadonnees de documents sports (URL ou mediaId).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(form.documents || []).map((item, index) => (
            <div key={`document-${index}`} className="rounded-lg border p-4 space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input
                    value={item.title}
                    onChange={(event) => updateDocument(index, 'title', event.target.value)}
                    placeholder="Document"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priorite</Label>
                  <Input
                    type="number"
                    value={item.priority ?? ''}
                    onChange={(event) => updateDocument(index, 'priority', toPriorityValue(event.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={item.description || ''}
                  onChange={(event) => updateDocument(index, 'description', event.target.value)}
                  placeholder="Description optionnelle"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>URL (optionnel)</Label>
                  <Input
                    value={item.url || ''}
                    onChange={(event) => updateDocument(index, 'url', event.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>mediaId (optionnel)</Label>
                  <Input
                    value={item.mediaId || ''}
                    onChange={(event) => updateDocument(index, 'mediaId', event.target.value)}
                    placeholder="media-id"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-villiers-gold" />
            Verification module
          </CardTitle>
          <CardDescription>
            Cette page n&apos;utilise pas de filtrage texte. Les associations proviennent uniquement de la liste d&apos;IDs selectionnes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Equipements: endpoint MunicipalService categorie SPORT</li>
            <li>- Associations: IDs explicites en settings</li>
            <li>- Aucun fallback local</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
