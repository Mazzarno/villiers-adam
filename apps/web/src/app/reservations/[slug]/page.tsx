'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  Users,
  ArrowLeft,
  Check,
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Données de démonstration
const roomsData: Record<string, any> = {
  'salle-des-fetes': {
    id: '1',
    name: 'Salle des fêtes',
    description: 'Grande salle polyvalente pour vos événements festifs, mariages, anniversaires.',
    capacity: 150,
    amenities: ['Cuisine équipée', 'Sono', 'Tables et chaises', 'Parking', 'Accès PMR'],
    pricePerDay: 250,
    priceWeekend: 400,
  },
  'salle-du-conseil': {
    id: '2',
    name: 'Salle du conseil',
    description: 'Salle de réunion pour assemblées générales et réunions associatives.',
    capacity: 40,
    amenities: ['Vidéoprojecteur', 'Écran', 'Wifi', 'Tableau blanc'],
    pricePerDay: 50,
    priceWeekend: 80,
  },
  'salle-polyvalente': {
    id: '3',
    name: 'Salle polyvalente',
    description: 'Espace modulable pour activités sportives, cours et ateliers.',
    capacity: 60,
    amenities: ['Parquet', 'Miroirs', 'Vestiaires', 'Douches'],
    pricePerDay: 100,
    priceWeekend: 150,
  },
};

// Réservations existantes (simulation)
const existingReservations = [
  { date: '2025-01-25', room: 'salle-des-fetes' },
  { date: '2025-01-26', room: 'salle-des-fetes' },
  { date: '2025-02-01', room: 'salle-des-fetes' },
  { date: '2025-02-08', room: 'salle-du-conseil' },
];

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
  const room = roomsData[slug];

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [step, setStep] = useState<'calendar' | 'form' | 'success'>('calendar');
  const [loading, setLoading] = useState(false);

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

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Salle non trouvée</h1>
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
    return existingReservations.some((r) => r.date === dateStr && r.room === slug);
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

  const handleDateSelect = (day: number) => {
    if (isDatePast(day) || isDateReserved(day)) return;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
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

    setLoading(true);

    // Simulation d'envoi
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setLoading(false);
    setStep('success');
  };

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
  const price = selectedDateObj && isWeekend(selectedDateObj.getDate())
    ? room.priceWeekend
    : room.pricePerDay;

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
                  }}
                >
                  Nouvelle réservation
                </Button>
                <Button asChild>
                  <Link href="/">Retour à l'accueil</Link>
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
                      <p className="font-medium">{room.capacity} personnes</p>
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="pt-4 border-t">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-muted-foreground">Tarif</span>
                        <span className="text-2xl font-bold">{price}€</span>
                      </div>
                      {selectedDateObj && isWeekend(selectedDateObj.getDate()) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Tarif week-end appliqué
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Équipements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {room.amenities.map((amenity: string) => (
                      <li key={amenity} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

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
