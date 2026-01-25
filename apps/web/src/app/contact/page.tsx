'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HCaptchaWidget } from '@/components/forms/hcaptcha';
import api from '@/lib/api';
import { mairieConfig } from '@/lib/config';

const subjects = [
  'Demande d\'information',
  'Urbanisme',
  'État civil',
  'Vie scolaire',
  'Voirie et propreté',
  'Associations',
  'Autre',
];

const openingHours = [
  { day: 'Lundi', hours: '9h - 12h' },
  { day: 'Mardi', hours: '9h - 12h' },
  { day: 'Mercredi', hours: '9h - 12h' },
  { day: 'Jeudi', hours: '14h - 18h' },
  { day: 'Vendredi', hours: '9h - 12h' },
  { day: 'Samedi', hours: 'Fermé' },
  { day: 'Dimanche', hours: 'Fermé' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    honeypot: '', // Champ anti-spam
  });
  const [captchaToken, setCaptchaToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification honeypot
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
      await api.forms.submit({
        type: 'CONTACT',
        subject: formData.subject || undefined,
        message: formData.message,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
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
      setError('Une erreur est survenue. Veuillez réessayer.');
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
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Contact
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            Une question ? Besoin d&apos;un renseignement ? Contactez la mairie de Villiers-Adam.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Envoyez-nous un message</CardTitle>
              </CardHeader>
              <CardContent>
                {success ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Message envoyé !</h3>
                    <p className="text-muted-foreground mb-6">
                      Nous avons bien reçu votre message et vous répondrons dans les meilleurs délais.
                    </p>
                    <Button onClick={() => setSuccess(false)}>
                      Envoyer un autre message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Honeypot - champ caché anti-spam */}
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
                        <label htmlFor="name" className="text-sm font-medium">
                          Nom complet <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Jean Dupont"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="jean.dupont@email.fr"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          Téléphone
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="06 12 34 56 78"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">
                          Sujet <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Sélectionnez un sujet</option>
                          {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Votre message..."
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

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button type="submit" size="lg" disabled={loading}>
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Adresse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Mairie de Villiers-Adam
                  <br />
                  {mairieConfig.contact.adresse}
                </p>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Téléphone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`tel:${mairieConfig.contact.telephone.replace(/\s/g, '')}`}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {mairieConfig.contact.telephone}
                </a>
              </CardContent>
            </Card>

            {/* Email */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`mailto:${mairieConfig.contact.email}`}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {mairieConfig.contact.email}
                </a>
              </CardContent>
            </Card>

            {/* Opening hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Horaires d&apos;ouverture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  {openingHours.map(({ day, hours }) => (
                    <div key={day} className="flex justify-between">
                      <dt className="text-muted-foreground">{day}</dt>
                      <dd className={hours === 'Fermé' ? 'text-muted-foreground' : ''}>
                        {hours}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="container pb-12">
        <Card>
          <CardContent className="p-0">
            <div className="aspect-[21/9] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground">Carte interactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
