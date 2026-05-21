'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

type DaySchedule = {
  isOpen: boolean;
  morningOpen: string;
  morningClose: string;
  afternoonOpen: string;
  afternoonClose: string;
};

type Schedule = Record<DayKey, DaySchedule>;

const days: { id: DayKey; label: string }[] = [
  { id: 'monday', label: 'Lundi' },
  { id: 'tuesday', label: 'Mardi' },
  { id: 'wednesday', label: 'Mercredi' },
  { id: 'thursday', label: 'Jeudi' },
  { id: 'friday', label: 'Vendredi' },
  { id: 'saturday', label: 'Samedi' },
  { id: 'sunday', label: 'Dimanche' },
];

const labelToKey: Record<string, DayKey> = {
  Lundi: 'monday',
  Mardi: 'tuesday',
  Mercredi: 'wednesday',
  Jeudi: 'thursday',
  Vendredi: 'friday',
  Samedi: 'saturday',
  Dimanche: 'sunday',
  Monday: 'monday',
  Tuesday: 'tuesday',
  Wednesday: 'wednesday',
  Thursday: 'thursday',
  Friday: 'friday',
  Saturday: 'saturday',
  Sunday: 'sunday',
};

const defaultSchedule: Schedule = {
  monday: { isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '17:00' },
  tuesday: { isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '17:00' },
  wednesday: { isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '17:00' },
  thursday: { isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '17:00' },
  friday: { isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '17:00' },
  saturday: { isOpen: false, morningOpen: '', morningClose: '', afternoonOpen: '', afternoonClose: '' },
  sunday: { isOpen: false, morningOpen: '', morningClose: '', afternoonOpen: '', afternoonClose: '' },
};

const isSchedule = (value: unknown): value is Schedule => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return days.every((day) => {
    const entry = (value as Schedule)[day.id];
    return (
      entry &&
      typeof entry === 'object' &&
      typeof entry.isOpen === 'boolean' &&
      'morningOpen' in entry
    );
  });
};

const parseTimeRanges = (raw: string) => {
  const matches = Array.from(raw.matchAll(/(\d{1,2}:\d{2})/g)).map((match) => match[1]);
  return matches;
};

const parseOpeningHours = (value: unknown): Schedule => {
  if (isSchedule(value)) {
    return value;
  }

  const schedule: Schedule = JSON.parse(JSON.stringify(defaultSchedule));

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    Object.entries(value as Record<string, unknown>).forEach(([label, rawValue]) => {
      const key = labelToKey[label];
      if (!key) return;

      const text =
        typeof rawValue === 'string'
          ? rawValue
          : Array.isArray(rawValue)
            ? rawValue.join(' ')
            : '';

      if (!text || /ferm[eé]/i.test(text)) {
        schedule[key] = {
          isOpen: false,
          morningOpen: '',
          morningClose: '',
          afternoonOpen: '',
          afternoonClose: '',
        };
        return;
      }

      const times = parseTimeRanges(text);
      schedule[key] = {
        isOpen: true,
        morningOpen: times[0] || '',
        morningClose: times[1] || '',
        afternoonOpen: times[2] || '',
        afternoonClose: times[3] || '',
      };
    });
  }

  return schedule;
};

const formatSchedule = (schedule: Schedule) => {
  const result: Record<string, string> = {};
  days.forEach((day) => {
    const data = schedule[day.id];
    if (!data.isOpen) {
      result[day.label] = 'Fermé';
      return;
    }

    const ranges = [];
    if (data.morningOpen && data.morningClose) {
      ranges.push(`${data.morningOpen}-${data.morningClose}`);
    }
    if (data.afternoonOpen && data.afternoonClose) {
      ranges.push(`${data.afternoonOpen}-${data.afternoonClose}`);
    }

    result[day.label] = ranges.length > 0 ? ranges.join(' / ') : 'Ouvert';
  });
  return result;
};

type OpeningHoursEditorProps = {
  value?: unknown;
  onChange?: (value: Record<string, string>) => void;
  className?: string;
};

export function OpeningHoursEditor({ value, onChange, className }: OpeningHoursEditorProps) {
  const [schedule, setSchedule] = React.useState<Schedule>(() => parseOpeningHours(value));

  React.useEffect(() => {
    setSchedule(parseOpeningHours(value));
  }, [value]);

  const updateDay = (dayId: DayKey, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule((prev) => {
      const next = {
        ...prev,
        [dayId]: { ...prev[dayId], [field]: value },
      };
      onChange?.(formatSchedule(next));
      return next;
    });
  };

  return (
    <div className={cn('space-y-3', className)}>
      {days.map((day) => (
        <div
          key={day.id}
          className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-3 min-w-[150px]">
            <Switch
              checked={schedule[day.id].isOpen}
              onCheckedChange={(checked) => updateDay(day.id, 'isOpen', checked)}
            />
            <Label className="font-medium">{day.label}</Label>
          </div>

          {schedule[day.id].isOpen ? (
            <div className="flex flex-wrap gap-3 flex-1">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Matin</Label>
                <Input
                  type="time"
                  value={schedule[day.id].morningOpen}
                  onChange={(e) => updateDay(day.id, 'morningOpen', e.target.value)}
                  className="w-28"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="time"
                  value={schedule[day.id].morningClose}
                  onChange={(e) => updateDay(day.id, 'morningClose', e.target.value)}
                  className="w-28"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Après-midi</Label>
                <Input
                  type="time"
                  value={schedule[day.id].afternoonOpen}
                  onChange={(e) => updateDay(day.id, 'afternoonOpen', e.target.value)}
                  className="w-28"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="time"
                  value={schedule[day.id].afternoonClose}
                  onChange={(e) => updateDay(day.id, 'afternoonClose', e.target.value)}
                  className="w-28"
                />
              </div>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Fermé</span>
          )}
        </div>
      ))}
    </div>
  );
}
