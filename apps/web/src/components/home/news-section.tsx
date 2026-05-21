'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Calendar, ArrowUpRight, Newspaper, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, truncate } from '@/lib/utils';
import type { Article } from '@/lib/api';

interface NewsSectionProps {
  articles: Article[];
}

const fallbackCards = [
  {
    icon: Newspaper,
    title: 'La mairie vous informe',
    description: 'Retrouvez ici les dernieres actualites de la commune : projets en cours, decisions municipales et informations pratiques.',
  },
  {
    icon: FileText,
    title: 'Publications administratives',
    description: 'Arretes municipaux, deliberations du conseil, comptes-rendus et documents officiels de la mairie.',
  },
  {
    icon: MessageSquare,
    title: 'Breves de la commune',
    description: 'Actualites courtes, annonces de la vie locale et informations pratiques pour les habitants.',
  },
];

export function NewsSection({ articles }: NewsSectionProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const featuredArticle = articles[0];
  const secondaryArticles = articles.slice(1, 3);
  const isEmpty = articles.length === 0;

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 relative overflow-hidden">
      {/* Fond subtil */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container relative">
        {/* Header éditorial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
              <span className="w-8 h-px bg-villiers-gold" />
              A la une
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
              Actualites
            </h2>
          </div>
          <Button
            asChild
            variant="outline"
            className="self-start lg:self-auto rounded-organic border-villiers-blue/20 hover:border-villiers-gold hover:bg-villiers-gold/5 transition-all duration-300 group"
          >
            <Link href="/actualites">
              Toutes les actualites
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {isEmpty ? (
          /* Fallback statique quand aucun article */
          <div className="grid md:grid-cols-3 gap-6">
            {fallbackCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="p-6 rounded-organic border-2 border-dashed border-border/60 bg-background/50 h-full flex flex-col items-start">
                    <div className="w-12 h-12 rounded-full bg-villiers-gold/10 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-villiers-gold" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {card.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Layout éditorial : 1 featured + 2 secondary */
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Article principal (large) */}
            {featuredArticle && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-7"
              >
                <Link href={`/actualites/${featuredArticle.slug}`} className="block group">
                  <article className="relative h-full">
                    {/* Image avec parallaxe */}
                    {featuredArticle.featuredImage && (
                      <div className="relative aspect-[16/10] lg:aspect-[4/3] rounded-organic-lg overflow-hidden mb-6">
                        <ParallaxImage
                          src={featuredArticle.featuredImage}
                          alt={featuredArticle.title}
                          scrollYProgress={scrollYProgress}
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-villiers-blue/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        {/* Badge catégorie repositionné */}
                        {featuredArticle.category && (
                          <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-medium bg-villiers-gold text-villiers-blue rounded-organic-sm">
                            {featuredArticle.category.name}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Contenu */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 text-villiers-gold" />
                        <time className="font-mono text-xs">
                          {formatDate(featuredArticle.publishedAt || featuredArticle.createdAt)}
                        </time>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-heading font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                        {featuredArticle.title}
                      </h3>
                      {featuredArticle.excerpt && (
                        <p className="text-muted-foreground leading-relaxed">
                          {truncate(featuredArticle.excerpt, 200)}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-villiers-gold pt-2">
                        Lire l&apos;article
                        <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </span>
                    </div>
                  </article>
                </Link>
              </motion.div>
            )}

            {/* Articles secondaires (colonne droite) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {secondaryArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 0.2 + index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link href={`/actualites/${article.slug}`} className="block group">
                    <article className="flex gap-4 p-4 rounded-organic bg-background border border-border/50 transition-all duration-300 hover:shadow-organic-hover hover:-translate-y-1">
                      {/* Image miniature */}
                      {article.featuredImage && (
                        <div className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-organic-sm overflow-hidden shrink-0">
                          <Image
                            src={article.featuredImage}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      )}
                      {/* Contenu */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {article.category && (
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded-full">
                                {article.category.name}
                              </span>
                            )}
                          </div>
                          <h4 className="font-heading font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between">
                          <time className="text-xs font-mono text-muted-foreground">
                            {formatDate(article.publishedAt || article.createdAt)}
                          </time>
                          <ArrowRight className="h-4 w-4 text-villiers-gold opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}

              {/* CTA supplémentaire */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex-1 flex items-center justify-center p-8 rounded-organic bg-villiers-blue/5 border border-villiers-blue/10"
              >
                <Link
                  href="/actualites"
                  className="flex items-center gap-3 text-villiers-blue hover:text-villiers-gold transition-colors group"
                >
                  <span className="font-heading font-medium">
                    Voir toutes les actualites
                  </span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Composant image avec parallaxe
function ParallaxImage({
  src,
  alt,
  scrollYProgress,
}: {
  src: string;
  alt: string;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const y = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  return (
    <motion.div className="absolute inset-0" style={{ y }}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover scale-110"
      />
    </motion.div>
  );
}
