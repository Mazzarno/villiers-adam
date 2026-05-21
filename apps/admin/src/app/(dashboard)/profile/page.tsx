'use client';

import * as React from 'react';
import { User, Mail, Lock, Shield, Save, Image as ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MediaPicker } from '@/components/media/media-picker';
import { auth, users } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: string;
  mfaEnabled: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const resolveAvatarUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_URL}${url}`;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

type MfaSetupState = {
  secret: string;
  qrCodeDataUrl: string;
};

export default function ProfilePage() {
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [isUpdatingMfa, setIsUpdatingMfa] = React.useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = React.useState(false);
  const [mfaSetup, setMfaSetup] = React.useState<MfaSetupState | null>(null);
  const [mfaConfirmCode, setMfaConfirmCode] = React.useState('');
  const [mfaDisableCode, setMfaDisableCode] = React.useState('');

  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    avatarUrl: null as string | null,
  });

  const [passwordData, setPasswordData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const loadProfile = React.useCallback(async () => {
    try {
      const data = await auth.me();
      setProfile(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        avatarUrl: data.avatarUrl ?? null,
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le profil',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  React.useEffect(() => {
    if (profile?.mfaEnabled) {
      setMfaSetup(null);
      setMfaConfirmCode('');
    }
  }, [profile?.mfaEnabled]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!profile) {
        throw new Error('Profil introuvable');
      }
      await users.update(profile.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        avatarUrl: formData.avatarUrl,
      });
      await loadProfile();
      await refreshUser();
      toast({
        title: 'Succès',
        description: 'Profil mis à jour',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 8 caractères',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      await auth.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast({
        title: 'Succès',
        description: 'Mot de passe modifié',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast({
        title: 'Erreur',
        description: getErrorMessage(error, 'Impossible de changer le mot de passe'),
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleInitializeMFA = async () => {
    setIsUpdatingMfa(true);

    try {
      const setup = await auth.enableMfa();
      setMfaSetup({
        secret: setup.secret,
        qrCodeDataUrl: setup.qrCodeDataUrl,
      });
      setMfaConfirmCode('');
      toast({
        title: 'Configuration MFA',
        description: 'Scannez le QR code puis confirmez avec un code à 6 chiffres.',
      });
    } catch (error) {
      console.error('Failed to initialize MFA:', error);
      toast({
        title: 'Erreur',
        description: getErrorMessage(error, 'Impossible d’initialiser la MFA'),
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingMfa(false);
    }
  };

  const handleConfirmMFA = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mfaConfirmCode.length !== 6) {
      toast({
        title: 'Erreur',
        description: 'Le code MFA doit contenir 6 chiffres',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingMfa(true);

    try {
      await auth.confirmMfa(mfaConfirmCode);
      await loadProfile();
      setMfaSetup(null);
      setMfaConfirmCode('');
      toast({
        title: 'Succès',
        description: 'MFA activée',
      });
    } catch (error) {
      console.error('Failed to confirm MFA:', error);
      toast({
        title: 'Erreur',
        description: getErrorMessage(error, 'Impossible de confirmer la MFA'),
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingMfa(false);
    }
  };

  const handleDisableMFA = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mfaDisableCode.length !== 6) {
      toast({
        title: 'Erreur',
        description: 'Le code MFA doit contenir 6 chiffres',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingMfa(true);

    try {
      await auth.disableMfa(mfaDisableCode);
      await loadProfile();
      setMfaDisableCode('');
      toast({
        title: 'Succès',
        description: 'MFA désactivée',
      });
    } catch (error) {
      console.error('Failed to disable MFA:', error);
      toast({
        title: 'Erreur',
        description: getErrorMessage(error, 'Impossible de désactiver la MFA'),
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingMfa(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et vos paramètres de sécurité
        </p>
      </div>

      {/* Profile info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
          <CardDescription>
            Mettez à jour vos informations de profil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16">
                {formData.avatarUrl ? (
                  <AvatarImage src={resolveAvatarUrl(formData.avatarUrl)} alt="Avatar" />
                ) : null}
                <AvatarFallback>
                  {formData.firstName?.charAt(0)}
                  {formData.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAvatarPicker(true)}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Choisir un avatar
                </Button>
                {formData.avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: null }))}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
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
            <Separator />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Rôle : <span className="font-medium text-foreground">{profile?.role}</span>
              </div>
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Mot de passe
          </CardTitle>
          <CardDescription>
            Modifiez votre mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Au moins 8 caractères
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
              />
            </div>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? 'Modification...' : 'Changer le mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Renforcez la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="font-medium">Authentification à deux facteurs (MFA)</div>
              <div className="text-sm text-muted-foreground">
                Ajoutez une couche de sécurité supplémentaire à votre compte
              </div>
            </div>

            {profile?.mfaEnabled ? (
              <form onSubmit={handleDisableMFA} className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  MFA activée. Entrez un code valide de votre application pour la désactiver.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="mfaDisableCode">Code MFA</Label>
                  <Input
                    id="mfaDisableCode"
                    value={mfaDisableCode}
                    onChange={(e) => setMfaDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    inputMode="numeric"
                    maxLength={6}
                    className="max-w-48"
                  />
                </div>
                <Button type="submit" variant="outline" disabled={isUpdatingMfa}>
                  {isUpdatingMfa ? 'Désactivation...' : 'Désactiver la MFA'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleInitializeMFA}
                  disabled={isUpdatingMfa}
                >
                  {isUpdatingMfa ? 'Initialisation...' : 'Configurer la MFA'}
                </Button>

                {mfaSetup && (
                  <form onSubmit={handleConfirmMFA} className="space-y-3 rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">
                      Scannez ce QR code avec votre application d’authentification, puis saisissez le code.
                    </p>
                    <Image
                      src={mfaSetup.qrCodeDataUrl}
                      alt="QR code MFA"
                      width={176}
                      height={176}
                      unoptimized
                      className="rounded-md border bg-white p-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Clé de secours: <span className="font-mono">{mfaSetup.secret}</span>
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="mfaConfirmCode">Code MFA</Label>
                      <Input
                        id="mfaConfirmCode"
                        value={mfaConfirmCode}
                        onChange={(e) => setMfaConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        inputMode="numeric"
                        maxLength={6}
                        className="max-w-48"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={isUpdatingMfa}>
                        {isUpdatingMfa ? 'Activation...' : 'Confirmer et activer'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setMfaSetup(null);
                          setMfaConfirmCode('');
                        }}
                        disabled={isUpdatingMfa}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <MediaPicker
        open={showAvatarPicker}
        onOpenChange={setShowAvatarPicker}
        onSelect={(media) => {
          setFormData((prev) => ({ ...prev, avatarUrl: media.url }));
          setShowAvatarPicker(false);
        }}
        accept={['image/*']}
      />
    </div>
  );
}
