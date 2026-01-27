'use client';

import * as React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { motion } from 'framer-motion';
import { Facebook, ExternalLink, ThumbsUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/villiersadam';
const FACEBOOK_PAGE_NAME = 'Villiers-Adam';

export function FacebookFeed() {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as unknown as { FB?: unknown }).FB) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <>
      <Script
        id="facebook-sdk"
        src="https://connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v18.0"
        strategy="lazyOnload"
        onLoad={() => setIsLoaded(true)}
      />
      <section className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-muted/30 to-background">
      {/* Formes décoratives */}
      <div className="absolute top-10 right-[10%] w-60 h-60 rounded-full border border-villiers-gold/10" />
      <div className="absolute bottom-20 left-[5%] w-40 h-40 rounded-full border border-villiers-blue/10" />

      <div className="container relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Contenu gauche */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            {/* Header */}
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
                <span className="w-8 h-px bg-villiers-gold" />
                Suivez-nous
              </span>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-heading font-semibold text-foreground mb-4">
                Restez <span className="display-italic text-villiers-blue">connectés</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Retrouvez toute l&apos;actualité de votre commune sur notre page Facebook.
                Événements, informations pratiques, vie locale... ne manquez rien !
              </p>
            </div>

            {/* Stats simulées */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-background border border-border/50 rounded-organic">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-villiers-blue/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-villiers-blue" />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-semibold text-foreground">800+</p>
                    <p className="text-xs text-muted-foreground">Abonnés</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-background border border-border/50 rounded-organic">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-villiers-gold/10 flex items-center justify-center">
                    <ThumbsUp className="h-5 w-5 text-villiers-gold" />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-semibold text-foreground">150+</p>
                    <p className="text-xs text-muted-foreground">Publications/an</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-organic transition-all duration-300 hover:scale-[1.02] hover:shadow-organic-hover group"
              >
                <a
                  href={FACEBOOK_PAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Rejoindre la page
                  <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-organic"
              >
                <Link href="/actualites">
                  Voir toutes les actualités
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Embed Facebook */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="relative">
              {/* Cadre décoratif */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-villiers-gold/20 rounded-organic-lg -z-10" />

              {/* Conteneur Facebook */}
              <div className="bg-background border border-border/50 rounded-organic-lg overflow-hidden shadow-villiers-lg">
                {/* Header personnalisé */}
                <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                    <Facebook className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{FACEBOOK_PAGE_NAME}</p>
                    <p className="text-xs text-muted-foreground">Page officielle</p>
                  </div>
                </div>

                {/* Embed ou fallback */}
                <div className="p-4">
                  {isLoaded ? (
                    <div
                      className="fb-page"
                      data-href={FACEBOOK_PAGE_URL}
                      data-tabs="timeline"
                      data-width=""
                      data-height="500"
                      data-small-header="false"
                      data-adapt-container-width="true"
                      data-hide-cover="false"
                      data-show-facepile="true"
                    >
                      <blockquote
                        cite={FACEBOOK_PAGE_URL}
                        className="fb-xfbml-parse-ignore"
                      >
                        <a href={FACEBOOK_PAGE_URL}>{FACEBOOK_PAGE_NAME}</a>
                      </blockquote>
                    </div>
                  ) : (
                    /* Fallback si le SDK n'est pas chargé */
                    <div className="flex flex-col items-center justify-center h-[500px] text-center">
                      <div className="w-16 h-16 rounded-full bg-[#1877F2]/10 flex items-center justify-center mb-4">
                        <Facebook className="h-8 w-8 text-[#1877F2]" />
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Chargement du fil Facebook...
                      </p>
                      <p className="text-sm text-muted-foreground mb-6">
                        Si le fil ne s&apos;affiche pas, vous pouvez visiter directement notre page.
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-organic"
                      >
                        <a
                          href={FACEBOOK_PAGE_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Facebook className="mr-2 h-4 w-4" />
                          Ouvrir Facebook
                          <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Root div pour Facebook SDK */}
      <div id="fb-root" />
    </section>
    </>
  );
}
