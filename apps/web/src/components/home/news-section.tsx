'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, truncate } from '@/lib/utils';
import type { Article } from '@/lib/api';

interface NewsSectionProps {
  articles: Article[];
}

export function NewsSection({ articles }: NewsSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-2">
              Actualités
            </h2>
            <p className="text-muted-foreground">
              Suivez les dernières nouvelles de la commune
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/actualites">
              Toutes les actualités
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Articles grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {articles.map((article, index) => (
            <motion.div key={article.id} variants={itemVariants}>
              <Link href={`/actualites/${article.slug}`}>
                <Card className="h-full overflow-hidden card-hover group">
                  {article.featuredImage && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={article.featuredImage}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      {article.category && (
                        <Badge variant="secondary">{article.category.name}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(article.publishedAt || article.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-lg font-heading font-semibold leading-tight group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="pb-4">
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground">
                        {truncate(article.excerpt, 120)}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      Lire la suite
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
