'use client';

import * as React from 'react';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HCaptchaWidget } from '@/components/forms/hcaptcha';
import api from '@/lib/api';

type NewsletterTopic = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

interface NewsletterSignupProps {
  variant?: 'light' | 'dark';
}

export function NewsletterSignup({ variant = 'light' }: NewsletterSignupProps) {
  const [email, setEmail] = React.useState('');
  const [topics, setTopics] = React.useState<NewsletterTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = React.useState(0);

  const isDark = variant === 'dark';
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? '';

  React.useEffect(() => {
    api.newsletter.topics()
      .then(setTopics)
      .catch(() => setTopics([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    if (siteKey && !captchaToken) {
      setStatus('error');
      setErrorMessage('Veuillez valider le captcha.');
      return;
    }

    try {
      await api.newsletter.subscribe({
        email,
        topicIds: selectedTopics.length > 0 ? selectedTopics : undefined,
        captchaToken,
      });
      setStatus('success');
      setEmail('');
      setSelectedTopics([]);
      setCaptchaToken(null);
      setCaptchaKey((value) => value + 1);
    } catch {
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-3 p-4 rounded-organic border ${
        isDark
          ? 'bg-white/5 border-white/10'
          : 'bg-villiers-green/5 border-villiers-green/20'
      }`}>
        <CheckCircle2 className={`h-5 w-5 shrink-0 ${isDark ? 'text-villiers-gold' : 'text-villiers-green'}`} />
        <p className={`text-sm ${isDark ? 'text-white/80' : 'text-foreground'}`}>
          Inscription confirmée ! Vérifiez votre boîte mail pour confirmer votre abonnement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-5 w-5 text-villiers-gold" />
        <h3 className={`font-heading text-lg font-semibold ${isDark ? 'text-villiers-gold' : 'text-foreground'}`}>
          Newsletter
        </h3>
      </div>
      <p className={`text-sm ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
        Restez informé de l&apos;actualité de la commune.
      </p>

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => toggleTopic(topic.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedTopics.includes(topic.id)
                  ? isDark
                    ? 'bg-villiers-gold/20 text-villiers-gold'
                    : 'bg-villiers-blue text-white'
                  : isDark
                    ? 'bg-white/10 text-white/60 hover:bg-white/15'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {topic.name}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Input
          name="email"
          type="email"
          placeholder="votre@email.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          className={`flex-1 ${
            isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-white/40' : ''
          }`}
          aria-label="Adresse email pour la newsletter"
        />
        <Button
          type="submit"
          disabled={status === 'loading' || !email}
          size="sm"
          className={`w-full sm:w-auto ${isDark ? 'bg-villiers-gold text-villiers-blue hover:bg-villiers-gold/80 font-semibold' : ''}`}
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "S'inscrire"
          )}
        </Button>
      </form>

      {siteKey && (
        <div className="pt-1">
          <HCaptchaWidget
            key={captchaKey}
            siteKey={siteKey}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
            size="compact"
          />
        </div>
      )}

      {status === 'error' && (
        <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-500'}`}>{errorMessage}</p>
      )}
    </div>
  );
}
