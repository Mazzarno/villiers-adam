'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  Users,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HCaptchaWidget } from '@/components/forms/hcaptcha';
import api, { type Room } from '@/lib/api';
import { cn } from '@/lib/utils';

type ReservationSlot = {
  startsAt: string;
  endsAt: string;
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Lundi = 0
}

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function ReservationRoomPage() {
  const params = useParams();
  const slug = params.slug as string;

  const today = new Date();
  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [step, setStep] = useState<'calendar' | 'form' | 'success'>('calendar');
  const [loading, setLoading] = useState(false);
  const [checkingDate, setCheckingDate] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [reservedDates, setReservedDates] = useState<Set<string>>(new Set());
  const [selectedSlots, setSelectedSlots] = useState<ReservationSlot[]>([]);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    purpose: '',
    attendees: '',
    message: '',
    honeypot: '',
  });

  useEffect(() => {
    let active = true;
    const loadRoom = async () => {
      try {
        setRoomLoading(true);
        const data = await api.rooms.get(slug);
        if (active) {
          setRoom(data);
        }
      } catch {
        if (active) {
          setRoomError('Impossible de charger cette salle.');
        }
      } finally {
        if (active) {
          setRoomLoading(false);
        }
      }
    };

    if (slug) {
      loadRoom();
    }

    return () => {
      active = false;
    };
  }, [slug]);

  if (roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground">Chargement de la salle...</p>
        </div>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Salle non trouvée</h1>
          {roomError && <p className="text-muted-foreground mb-4">{roomError}</p>}
          <Button asChild>
            <Link href="/reservations">Retour aux réservations</Link>
          </Button>
        </div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const isDateReserved = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservedDates.has(dateStr);
  };

  const isDatePast = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const isWeekend = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const handleDateSelect = async (day: number) => {
    if (isDatePast(day)) return;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setCheckingDate(true);
    setError('');

    try {
      const slots = await api.reservations.slots(room.id, dateStr);
      setSelectedSlots(slots.reservations);
      if (slots.reservations.length > 0) {
        setReservedDates((prev) => new Set(prev).add(dateStr));
        setSelectedDate(null);
        setError('Cette date est déjà réservée.');
        return;
      }
      setSelectedDate(dateStr);
    } catch {
      setError('Impossible de vérifier la disponibilité pour cette date.');
    } finally {
      setCheckingDate(false);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.honeypot) return;

    if (siteKey && !captchaToken) {
      setError('Veuillez valider le captcha avant d\'envoyer la demande.');
      return;
    }

    if (!selectedDate) {
      setError('Veuillez sélectionner une date avant d\'envoyer la demande.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const startsAt = new Date(`${selectedDate}T00:00:00`);
      const endsAt = new Date(`${selectedDate}T23:59:59`);

      const availability = await api.reservations.checkAvailability({
        roomId: room.id,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      });

      if (!availability.available) {
        setError('La salle n\'est pas disponible à cette date.');
        return;
      }

      const notes = [
        formData.organization ? `Organisation : ${formData.organization}` : null,
        formData.purpose ? `Objet : ${formData.purpose}` : null,
        formData.attendees ? `Participants : ${formData.attendees}` : null,
        formData.message ? `Message : ${formData.message}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      await api.reservations.create({
        roomId: room.id,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        requesterName: formData.name,
        requesterEmail: formData.email,
        requesterPhone: formData.phone || undefined,
        notes: notes || undefined,
        captchaToken: captchaToken || null,
      });

      setStep('success');
      setCaptchaToken('');
      setError('');
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-8">
        <div className="container">
          <Link
            href="/reservations"
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Toutes les salles
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
            {room.name}
          </h1>
          <p className="text-primary-foreground/80">{room.description}</p>
        </div>
      </section>

      {/* Content */}
      <section className="container py-8">
        {step === 'success' ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Demande envoyée !</h2>
              <p className="text-muted-foreground mb-6">
                Votre demande de réservation pour le{' '}
                {selectedDateObj?.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                a bien été envoyée.
                <br />
                Vous recevrez une confirmation par email sous 48h.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('calendar');
                      setSelectedDate(null);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        organization: '',
                        purpose: '',
                        attendees: '',
                        message: '',
                        honeypot: '',
                      });
                      setCaptchaToken('');
                    }}
                  >
                  Nouvelle réservation
                </Button>
                <Button asChild>
                  <Link href="/">Retour à l&apos;accueil</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {step === 'calendar' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Sélectionnez une date</CardTitle>
                    <CardDescription>
                      Choisissez la date souhaitée pour votre réservation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Calendar header */}
                    <div className="flex items-center justify-between mb-6">
                      <Button variant="ghost" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <h3 className="font-semibold text-lg">
                        {monthNames[currentMonth]} {currentYear}
                      </h3>
                      <Button variant="ghost" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {weekDays.map((day) => (
                        <div
                          key={day}
                          className="text-center text-sm font-medium text-muted-foreground py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {/* Empty cells for first week */}
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}

                      {/* Days */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isPast = isDatePast(day);
                        const isReserved = isDateReserved(day);
                        const isSelected = selectedDate === dateStr;
                        const weekend = isWeekend(day);

                        return (
                          <button
                            key={day}
                            onClick={() => handleDateSelect(day)}
                            disabled={isPast || isReserved}
                            className={cn(
                              'aspect-square rounded-lg text-sm font-medium transition-all',
                              isPast && 'text-muted-foreground/30 cursor-not-allowed',
                              isReserved && 'bg-destructive/10 text-destructive cursor-not-allowed',
                              !isPast && !isReserved && 'hover:bg-primary/10 cursor-pointer',
                              isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                              weekend && !isPast && !isReserved && !isSelected && 'bg-secondary/20'
                            )}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-primary" />
                        <span>Sélectionné</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-destructive/10" />
                        <span>Réservé</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-secondary/20" />
                        <span>Week-end</span>
                      </div>
                    </div>

                    {/* Continue button */}
                    <div className="mt-6 pt-4 border-t">
                      {checkingDate && (
                        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Vérification de la disponibilité...
                        </div>
                      )}
                      <Button
                        onClick={() => setStep('form')}
                        disabled={!selectedDate}
                        className="w-full"
                        size="lg"
                      >
                        Continuer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Vos informations</CardTitle>
                    <CardDescription>
                      Remplissez le formulaire pour finaliser votre demande
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Honeypot */}
                      <input
                        type="text"
                        name="honeypot"
                        value={formData.honeypot}
                        onChange={(e) =>
                          setFormData({ ...formData, honeypot: e.target.value })
                        }
                        className="hidden"
                        tabIndex={-1}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">
                            Nom complet <span className="text-destructive">*</span>
                          </label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">
                            Email <span className="text-destructive">*</span>
                          </label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="phone" className="text-sm font-medium">
                            Téléphone <span className="text-destructive">*</span>
                          </label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="organization" className="text-sm font-medium">
                            Association / Entreprise
                          </label>
                          <Input
                            id="organization"
                            value={formData.organization}
                            onChange={(e) =>
                              setFormData({ ...formData, organization: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="purpose" className="text-sm font-medium">
                            Objet de la réservation <span className="text-destructive">*</span>
                          </label>
                          <Input
                            id="purpose"
                            value={formData.purpose}
                            onChange={(e) =>
                              setFormData({ ...formData, purpose: e.target.value })
                            }
                            placeholder="Ex: Anniversaire, réunion..."
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="attendees" className="text-sm font-medium">
                            Nombre de personnes <span className="text-destructive">*</span>
                          </label>
                          <Input
                            id="attendees"
                            type="number"
                            min="1"
                            max={room.capacity}
                            value={formData.attendees}
                            onChange={(e) =>
                              setFormData({ ...formData, attendees: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">
                          Message / Demandes particulières
                        </label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          rows={4}
                        />
                      </div>

                      {siteKey && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Vérification anti-spam
                          </label>
                          <HCaptchaWidget
                            siteKey={siteKey}
                            onVerify={setCaptchaToken}
                            onExpire={() => setCaptchaToken('')}
                            onError={() => setCaptchaToken('')}
                          />
                        </div>
                      )}

                      {error && <p className="text-sm text-destructive">{error}</p>}

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep('calendar')}
                        >
                          Retour
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1">
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Envoi en cours...
                            </>
                          ) : (
                            'Envoyer la demande'
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Room info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Salle</p>
                      <p className="font-medium">{room.name}</p>
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {new Date(selectedDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Capacité</p>
                      <p className="font-medium">
                        {room.capacity ? `${room.capacity} personnes` : 'Non renseignée'}
                      </p>
                    </div>
                  </div>

                  {room.location && (
                    <div className="flex items-center gap-3">
                      <Info className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Localisation</p>
                        <p className="font-medium">{room.location}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedDate && selectedSlots.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Créneaux réservés</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {selectedSlots.map((slot) => (
                      <div key={`${slot.startsAt}-${slot.endsAt}`}>
                        {new Date(slot.startsAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        –{' '}
                        {new Date(slot.endsAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Info */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      La réservation sera confirmée par email après validation par les services de la mairie.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
