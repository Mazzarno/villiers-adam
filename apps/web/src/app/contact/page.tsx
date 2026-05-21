'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HCaptchaWidget } from '@/components/forms/hcaptcha';
import { MapEmbed } from '@/components/map/map-embed';
import api from '@/lib/api';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { formatHoraireJour, type HoraireJour } from '@/lib/config';
import { cn } from '@/lib/utils';

const subjects = [
  'Demande d\'information',
  'Urbanisme',
  'Etat civil',
  'Vie scolaire',
  'Voirie et proprete',
  'Associations',
  'Autre',
];

const formatHoraires = (horaires?: Record<string, HoraireJour>) => {
  if (!horaires) {
    return null;
  }

  const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
  const joursLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return jours.map((jour, index) => {
    const horaire = (horaires[jour] ?? null) as HoraireJour;
    return {
      day: joursLabels[index],
      hours: formatHoraireJour(horaire),
      isOpen: horaire !== null,
    };
  });
};

const sectionAnimation = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true as const },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export default function ContactPage() {
  const { settings, isLoading } = usePublicSettings();
  const siteName = settings?.siteName || 'Mairie';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    honeypot: '',
  });
  const [captchaToken, setCaptchaToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? '';
  const municipalityProfile = settings?.municipalityProfile;
  const addressLine = municipalityProfile?.contact?.adresse || settings?.address?.street;
  const contactPhone = municipalityProfile?.contact?.telephone || settings?.contactPhone;
  const contactEmail = municipalityProfile?.contact?.email || settings?.contactEmail;
  const contactFax = municipalityProfile?.contact?.fax;
  const coordinates = municipalityProfile?.coordinates;
  const horaires = municipalityProfile?.horaires;
  const openingHours = formatHoraires(horaires);
  const saturdaySchedule = horaires?.samedi as HoraireJour | undefined;
  const settingsUnavailable = !isLoading && !settings;
  const openingHoursNote =
    saturdaySchedule && typeof saturdaySchedule === 'object' && saturdaySchedule.note
      ? saturdaySchedule.note
      : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.honeypot) {
      console.log('Bot detected');
      return;
    }

    if (siteKey && !captchaToken) {
      setError('Veuillez valider le captcha avant d\'envoyer le formulaire.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.contact.send({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || undefined,
        message: formData.message,
        website: formData.honeypot,
        captchaToken: captchaToken || null,
      });

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        honeypot: '',
      });
      setCaptchaToken('');
    } catch (err) {
      setError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero editorial */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        {/* Cercles decoratifs */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full border border-villiers-gold/10 hidden lg:block" />
        <div className="absolute bottom-10 right-32 w-32 h-32 rounded-full border border-villiers-blue/10 hidden lg:block" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
              <span className="w-8 h-px bg-villiers-gold" />
              Nous ecrire
            </span>
            <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">
              Contact
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Une question ? Besoin d&apos;un renseignement ? Contactez la mairie de {siteName}.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact form */}
            <motion.div
              className="lg:col-span-2 min-w-0"
              {...sectionAnimation}
            >
              <div className="min-w-0 bg-background rounded-organic-lg border border-border/50 p-6 lg:p-8">
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-6 break-words">
                  Envoyez-nous un message
                </h2>

                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-villiers-green/15 dark:bg-villiers-green/30 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-villiers-green" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold mb-2">Message envoye !</h3>
                    <p className="text-muted-foreground mb-6">
                      Nous avons bien recu votre message et vous repondrons dans les meilleurs delais.
                    </p>
                    <Button
                      onClick={() => setSuccess(false)}
                      variant="outline"
                      className="rounded-organic"
                    >
                      Envoyer un autre message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 min-w-0">
                    {/* Honeypot */}
                    <input
                      type="text"
                      name="honeypot"
                      value={formData.honeypot}
                      onChange={handleChange}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-foreground">
                          Nom complet <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          autoComplete="name"
                          placeholder="Jean Dupont"
                          className="rounded-organic border-border/50 focus:border-villiers-gold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                          Email <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          autoComplete="email"
                          spellCheck={false}
                          placeholder="jean.dupont@email.fr"
                          className="rounded-organic border-border/50 focus:border-villiers-gold"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-foreground">
                          Telephone
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          autoComplete="tel"
                          inputMode="tel"
                          placeholder="06 12 34 56 78"
                          className="rounded-organic border-border/50 focus:border-villiers-gold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium text-foreground">
                          Sujet <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          autoComplete="off"
                          className="flex h-10 w-full rounded-organic border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:border-villiers-gold"
                        >
                          <option value="">Selectionnez un sujet</option>
                          {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-foreground">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        autoComplete="off"
                        placeholder="Votre message..."
                        className="rounded-organic border-border/50 focus:border-villiers-gold"
                      />
                    </div>

                    {siteKey && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Verification anti-spam
                        </label>
                        <div className="max-w-full overflow-x-auto">
                          <HCaptchaWidget
                            siteKey={siteKey}
                            onVerify={setCaptchaToken}
                            onExpire={() => setCaptchaToken('')}
                            onError={() => setCaptchaToken('')}
                          />
                        </div>
                      </div>
                    )}

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading}
                      className="w-full sm:w-auto whitespace-normal text-center leading-snug rounded-organic"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Sidebar - style organique */}
            <div className="space-y-6 min-w-0">
              {/* Address */}
              <motion.div
                {...sectionAnimation}
                transition={{ ...sectionAnimation.transition, delay: 0.1 }}
                className="bg-background rounded-organic border border-border/50 p-6 min-w-0"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-villiers-gold/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-villiers-gold" />
                  </div>
                  Adresse
                </h3>
                <p className="text-sm text-muted-foreground break-words">
                  Mairie de {siteName}
                  <br />
                  {addressLine
                    ? addressLine
                    : settingsUnavailable
                      ? 'Les informations sont temporairement indisponibles.'
                      : 'Aucune donnee publiee pour le moment.'}
                </p>
              </motion.div>

              {/* Phone & Fax */}
              <motion.div
                {...sectionAnimation}
                transition={{ ...sectionAnimation.transition, delay: 0.15 }}
                className="bg-background rounded-organic border border-border/50 p-6 min-w-0"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-villiers-gold/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-villiers-gold" />
                  </div>
                  Telephone
                </h3>
                {contactPhone ? (
                  <a
                    href={`tel:${contactPhone.replace(/\s/g, '')}`}
                    className="text-sm font-mono hover:text-primary transition-colors block mb-2 break-words"
                  >
                    {contactPhone}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground mb-2">
                    {settingsUnavailable
                      ? 'Les informations sont temporairement indisponibles.'
                      : 'Aucune donnee publiee pour le moment.'}
                  </p>
                )}
                {contactFax && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Printer className="h-3.5 w-3.5" />
                    <span className="font-mono break-words">Fax : {contactFax}</span>
                  </div>
                )}
              </motion.div>

              {/* Email */}
              <motion.div
                {...sectionAnimation}
                transition={{ ...sectionAnimation.transition, delay: 0.2 }}
                className="bg-background rounded-organic border border-border/50 p-6 min-w-0"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-villiers-gold/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-villiers-gold" />
                  </div>
                  Email
                </h3>
                {contactEmail ? (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-sm hover:text-primary transition-colors break-all"
                  >
                    {contactEmail}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {settingsUnavailable
                      ? 'Les informations sont temporairement indisponibles.'
                      : 'Aucune donnee publiee pour le moment.'}
                  </p>
                )}
              </motion.div>

              {/* Opening hours */}
              <motion.div
                {...sectionAnimation}
                transition={{ ...sectionAnimation.transition, delay: 0.25 }}
                className="bg-background rounded-organic border border-border/50 p-6 min-w-0"
              >
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-villiers-gold/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-villiers-gold" />
                  </div>
                  Horaires d&apos;ouverture
                </h3>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement des horaires...</p>
                ) : openingHours ? (
                  <>
                    <dl className="space-y-2 text-sm">
                      {openingHours.map(({ day, hours, isOpen }) => (
                        <div key={day} className="flex justify-between gap-2">
                          <dt className="text-muted-foreground">{day}</dt>
                          <dd className={cn(
                            'font-mono text-xs text-right break-words',
                            !isOpen && 'text-muted-foreground/50'
                          )}>
                            {hours}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {openingHoursNote && (
                      <p className="text-xs text-muted-foreground/60 mt-3 italic">
                        {openingHoursNote}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {settingsUnavailable
                      ? 'Les informations sont temporairement indisponibles.'
                      : 'Aucune donnee publiee pour le moment.'}
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Map avec cadre decoratif */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <motion.div
            {...sectionAnimation}
            className="relative"
          >
            {/* Cadre decoratif decale */}
            <div className="absolute -top-3 -left-3 w-full h-full rounded-organic-lg border border-villiers-gold/20 hidden lg:block" />
            <div className="relative rounded-organic-lg overflow-hidden border border-border/50 bg-background">
              <div className="aspect-[21/9]">
                {coordinates ? (
                  <MapEmbed
                    lat={coordinates.lat}
                    lng={coordinates.lng}
                    label="Voir sur OpenStreetMap"
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                    {settingsUnavailable
                      ? 'Les informations sont temporairement indisponibles.'
                      : 'Aucune donnee publiee pour le moment.'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
