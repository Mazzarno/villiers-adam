'use client';

import * as React from 'react';
import { Clock, Save, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { settings } from '@/lib/api';

const days = [
  { id: 'lundi', label: 'Lundi' },
  { id: 'mardi', label: 'Mardi' },
  { id: 'mercredi', label: 'Mercredi' },
  { id: 'jeudi', label: 'Jeudi' },
  { id: 'vendredi', label: 'Vendredi' },
  { id: 'samedi', label: 'Samedi' },
  { id: 'dimanche', label: 'Dimanche' },
];

type DaySchedule = {
  isOpen: boolean;
  morningOpen: string;
  morningClose: string;
  afternoonOpen: string;
  afternoonClose: string;
  note: string;
};

const emptyDay: DaySchedule = {
  isOpen: false,
  morningOpen: '',
  morningClose: '',
  afternoonOpen: '',
  afternoonClose: '',
  note: '',
};

function apiToSchedule(horaires: Record<string, unknown>): Record<string, DaySchedule> {
  const result: Record<string, DaySchedule> = {};
  for (const day of days) {
    const value = horaires[day.id];
    if (!value || value === null) {
      result[day.id] = { ...emptyDay };
    } else if (typeof value === 'object') {
      const v = value as Record<string, unknown>;
      const matin = v.matin as { ouverture?: string; fermeture?: string } | null;
      const aprem = v.aprem as { ouverture?: string; fermeture?: string } | null;
      result[day.id] = {
        isOpen: !!(matin || aprem),
        morningOpen: matin?.ouverture || '',
        morningClose: matin?.fermeture || '',
        afternoonOpen: aprem?.ouverture || '',
        afternoonClose: aprem?.fermeture || '',
        note: (v.note as string) || '',
      };
    } else {
      result[day.id] = { ...emptyDay };
    }
  }
  return result;
}

function scheduleToApi(schedule: Record<string, DaySchedule>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const day of days) {
    const s = schedule[day.id];
    if (!s.isOpen) {
      result[day.id] = null;
      continue;
    }
    const entry: Record<string, unknown> = {};
    if (s.morningOpen && s.morningClose) {
      entry.matin = { ouverture: s.morningOpen, fermeture: s.morningClose };
    } else {
      entry.matin = null;
    }
    if (s.afternoonOpen && s.afternoonClose) {
      entry.aprem = { ouverture: s.afternoonOpen, fermeture: s.afternoonClose };
    } else {
      entry.aprem = null;
    }
    if (s.note) entry.note = s.note;
    result[day.id] = entry;
  }
  return result;
}

export default function HorairesPage() {
  const [schedule, setSchedule] = React.useState<Record<string, DaySchedule>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await settings.get();
        const profile = data.municipalityProfile as Record<string, unknown> | null;
        const horaires = (profile?.horaires || {}) as Record<string, unknown>;
        setSchedule(apiToSchedule(horaires));
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Initialize with empty schedule
        const empty: Record<string, DaySchedule> = {};
        for (const day of days) empty[day.id] = { ...emptyDay };
        setSchedule(empty);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const updateDay = (dayId: string, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const currentSettings = await settings.get();
      const profile = (currentSettings.municipalityProfile || {}) as Record<string, unknown>;
      await settings.update({
        municipalityProfile: {
          ...profile,
          horaires: scheduleToApi(schedule),
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Erreur lors de la sauvegarde');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Horaires d&apos;ouverture</h1>
          <p className="text-muted-foreground">
            Configurez les horaires d&apos;ouverture de la mairie. Les modifications seront visibles sur le site public.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? 'Enregistrement...' : saved ? 'Enregistré !' : 'Enregistrer'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horaires hebdomadaires
          </CardTitle>
          <CardDescription>
            Définissez les horaires pour chaque jour. Les horaires s&apos;afficheront sur la page Contact, le Footer et la page Mairie.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {days.map((day) => {
              const s = schedule[day.id];
              if (!s) return null;
              return (
                <div
                  key={day.id}
                  className="flex flex-col gap-4 p-4 border rounded-lg sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4 min-w-[150px]">
                    <Switch
                      checked={s.isOpen}
                      onCheckedChange={(checked) => updateDay(day.id, 'isOpen', checked)}
                    />
                    <Label className="font-medium">{day.label}</Label>
                  </div>

                  {s.isOpen ? (
                    <div className="flex flex-wrap gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground whitespace-nowrap">Matin :</Label>
                        <Input
                          type="time"
                          value={s.morningOpen}
                          onChange={(e) => updateDay(day.id, 'morningOpen', e.target.value)}
                          className="w-28"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={s.morningClose}
                          onChange={(e) => updateDay(day.id, 'morningClose', e.target.value)}
                          className="w-28"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground whitespace-nowrap">Après-midi :</Label>
                        <Input
                          type="time"
                          value={s.afternoonOpen}
                          onChange={(e) => updateDay(day.id, 'afternoonOpen', e.target.value)}
                          className="w-28"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={s.afternoonClose}
                          onChange={(e) => updateDay(day.id, 'afternoonClose', e.target.value)}
                          className="w-28"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground whitespace-nowrap">Note :</Label>
                        <Input
                          value={s.note}
                          onChange={(e) => updateDay(day.id, 'note', e.target.value)}
                          placeholder="Ex: Fermé en juillet/août"
                          className="w-52"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Fermé</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
