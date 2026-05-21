'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const mfaSchema = z.object({
  code: z.string().length(6, 'Le code doit contenir 6 chiffres'),
});

type LoginForm = z.infer<typeof loginSchema>;
type MfaForm = z.infer<typeof mfaSchema>;

export default function LoginPage() {
  const { login, verifyMfa } = useAuth();
  const [step, setStep] = React.useState<'login' | 'mfa'>('login');
  const [mfaToken, setMfaToken] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const mfaForm = useForm<MfaForm>({
    resolver: zodResolver(mfaSchema),
    defaultValues: { code: '' },
  });

  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await login(data.email, data.password);

      if (result?.requireMfa && result.mfaToken) {
        setMfaToken(result.mfaToken);
        setStep('mfa');
      }
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  const onMfaSubmit = async (data: MfaForm) => {
    setIsLoading(true);
    setError('');

    try {
      await verifyMfa(mfaToken, data.code);
    } catch (err) {
      setError('Code de vérification invalide');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'mfa') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Vérification en deux étapes</CardTitle>
          <CardDescription>
            Entrez le code affiché dans votre application d&apos;authentification
          </CardDescription>
        </CardHeader>
        <form onSubmit={mfaForm.handleSubmit(onMfaSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="code">Code de vérification</Label>
              <Input
                id="code"
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                {...mfaForm.register('code')}
              />
              {mfaForm.formState.errors.code && (
                <p className="text-sm text-destructive">
                  {mfaForm.formState.errors.code.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vérifier
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('login');
                setMfaToken('');
                setError('');
              }}
            >
              Retour
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
      <Image src="/images/blason.svg" alt="Blason" width={28} height={28} />
        </div>
        <CardTitle className="text-2xl">Connexion</CardTitle>
        <CardDescription>
          Accédez à l&apos;espace d&apos;administration
        </CardDescription>
      </CardHeader>
      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@villiers-adam.fr"
                className="pl-9"
                {...loginForm.register('email')}
              />
            </div>
            {loginForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {loginForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                {...loginForm.register('password')}
              />
            </div>
            {loginForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {loginForm.formState.errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Se connecter
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
