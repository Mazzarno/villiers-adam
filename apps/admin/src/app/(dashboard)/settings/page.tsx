'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Save,
  Loader2,
  Palette,
  Globe,
  Phone,
  Clock,
  Share2,
  Accessibility,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { settings as settingsApi, type Settings } from '@/lib/api';
import { toast } from 'sonner';

const settingsSchema = z.object({
  siteName: z.string().min(1, 'Le nom du site est requis'),
  siteDescription: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide'),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  fontHeading: z.string(),
  fontBody: z.string(),
  seniorModeEnabled: z.boolean(),
  dyslexicModeEnabled: z.boolean(),
  darkModeEnabled: z.boolean(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
});

type SettingsForm = z.infer<typeof settingsSchema>;

const fonts = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Marianne', label: 'Marianne' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Roboto', label: 'Roboto' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: '',
      siteDescription: '',
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      logoUrl: '',
      faviconUrl: '',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      seniorModeEnabled: true,
      dyslexicModeEnabled: true,
      darkModeEnabled: true,
      address: '',
      phone: '',
      email: '',
      facebookUrl: '',
      twitterUrl: '',
      instagramUrl: '',
    },
  });

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsApi.get();
      form.reset({
        siteName: data.siteName || '',
        siteDescription: data.siteDescription || '',
        primaryColor: data.primaryColor || '#1e40af',
        secondaryColor: data.secondaryColor || '#3b82f6',
        logoUrl: data.logoUrl || '',
        faviconUrl: data.faviconUrl || '',
        fontHeading: data.fontHeading || 'Inter',
        fontBody: data.fontBody || 'Inter',
        seniorModeEnabled: data.seniorModeEnabled ?? true,
        dyslexicModeEnabled: data.dyslexicModeEnabled ?? true,
        darkModeEnabled: data.darkModeEnabled ?? true,
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        facebookUrl: data.facebookUrl || '',
        twitterUrl: data.twitterUrl || '',
        instagramUrl: data.instagramUrl || '',
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SettingsForm) => {
    setIsSaving(true);
    try {
      await settingsApi.update(data);
      toast.success('Paramètres enregistrés');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
            <p className="text-muted-foreground">
              Configurez l&apos;apparence et les informations de votre site
            </p>
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">
              <Globe className="mr-2 h-4 w-4" />
              Général
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Palette className="mr-2 h-4 w-4" />
              Apparence
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Phone className="mr-2 h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="accessibility">
              <Accessibility className="mr-2 h-4 w-4" />
              Accessibilité
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="mr-2 h-4 w-4" />
              Réseaux sociaux
            </TabsTrigger>
          </TabsList>

          <motion.div variants={container} initial="hidden" animate="show">
            {/* General */}
            <TabsContent value="general">
              <motion.div variants={item}>
                <Card>
                  <CardHeader>
                    <CardTitle>Informations générales</CardTitle>
                    <CardDescription>
                      Nom et description de votre site
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Nom du site</Label>
                      <Input
                        id="siteName"
                        placeholder="Mairie de Villiers-Adam"
                        {...form.register('siteName')}
                      />
                      {form.formState.errors.siteName && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.siteName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Description</Label>
                      <Textarea
                        id="siteDescription"
                        placeholder="Site officiel de la commune..."
                        rows={3}
                        {...form.register('siteDescription')}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Branding */}
            <TabsContent value="branding">
              <motion.div variants={item} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Couleurs</CardTitle>
                    <CardDescription>
                      Personnalisez les couleurs de votre site
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Couleur principale</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            id="primaryColor"
                            className="h-10 w-10 rounded border cursor-pointer"
                            {...form.register('primaryColor')}
                          />
                          <Input
                            className="flex-1"
                            {...form.register('primaryColor')}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            id="secondaryColor"
                            className="h-10 w-10 rounded border cursor-pointer"
                            {...form.register('secondaryColor')}
                          />
                          <Input
                            className="flex-1"
                            {...form.register('secondaryColor')}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                      style={{
                        background: `linear-gradient(135deg, ${form.watch('primaryColor')} 0%, ${form.watch('secondaryColor')} 100%)`,
                      }}
                    >
                      Aperçu des couleurs
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Typographie</CardTitle>
                    <CardDescription>
                      Choisissez les polices de caractères
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Police des titres</Label>
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          {...form.register('fontHeading')}
                        >
                          {fonts.map((font) => (
                            <option key={font.value} value={font.value}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Police du corps</Label>
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          {...form.register('fontBody')}
                        >
                          {fonts.map((font) => (
                            <option key={font.value} value={font.value}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Logo et favicon</CardTitle>
                    <CardDescription>
                      Images représentant votre commune
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">URL du logo</Label>
                      <Input
                        id="logoUrl"
                        placeholder="https://..."
                        {...form.register('logoUrl')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faviconUrl">URL du favicon</Label>
                      <Input
                        id="faviconUrl"
                        placeholder="https://..."
                        {...form.register('faviconUrl')}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Contact */}
            <TabsContent value="contact">
              <motion.div variants={item}>
                <Card>
                  <CardHeader>
                    <CardTitle>Coordonnées</CardTitle>
                    <CardDescription>
                      Informations de contact de la mairie
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Textarea
                        id="address"
                        placeholder="1 Place de la Mairie..."
                        rows={3}
                        {...form.register('address')}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          placeholder="01 34 08 50 50"
                          {...form.register('phone')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="mairie@villiers-adam.fr"
                          {...form.register('email')}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Accessibility */}
            <TabsContent value="accessibility">
              <motion.div variants={item}>
                <Card>
                  <CardHeader>
                    <CardTitle>Modes d&apos;accessibilité</CardTitle>
                    <CardDescription>
                      Activez ou désactivez les options d&apos;accessibilité
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mode senior</Label>
                        <p className="text-sm text-muted-foreground">
                          Agrandit les textes et simplifie l&apos;interface
                        </p>
                      </div>
                      <Switch
                        checked={form.watch('seniorModeEnabled')}
                        onCheckedChange={(checked) =>
                          form.setValue('seniorModeEnabled', checked)
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mode dyslexique</Label>
                        <p className="text-sm text-muted-foreground">
                          Utilise une police adaptée à la dyslexie
                        </p>
                      </div>
                      <Switch
                        checked={form.watch('dyslexicModeEnabled')}
                        onCheckedChange={(checked) =>
                          form.setValue('dyslexicModeEnabled', checked)
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mode sombre</Label>
                        <p className="text-sm text-muted-foreground">
                          Permet aux utilisateurs de basculer en mode nuit
                        </p>
                      </div>
                      <Switch
                        checked={form.watch('darkModeEnabled')}
                        onCheckedChange={(checked) =>
                          form.setValue('darkModeEnabled', checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Social */}
            <TabsContent value="social">
              <motion.div variants={item}>
                <Card>
                  <CardHeader>
                    <CardTitle>Réseaux sociaux</CardTitle>
                    <CardDescription>
                      Liens vers vos pages sur les réseaux sociaux
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebookUrl">Facebook</Label>
                      <Input
                        id="facebookUrl"
                        placeholder="https://facebook.com/..."
                        {...form.register('facebookUrl')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitterUrl">Twitter / X</Label>
                      <Input
                        id="twitterUrl"
                        placeholder="https://twitter.com/..."
                        {...form.register('twitterUrl')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagramUrl">Instagram</Label>
                      <Input
                        id="instagramUrl"
                        placeholder="https://instagram.com/..."
                        {...form.register('instagramUrl')}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </form>
  );
}
