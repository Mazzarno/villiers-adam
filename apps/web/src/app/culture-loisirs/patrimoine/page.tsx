'use client';

import * as React from 'react';
import Image, { type ImageProps } from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Landmark,
  Church,
  TreePine,
  Clock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Music,
  BookOpen,
  Mountain,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/contexts/accessibility-context';

// Histoire de Villiers-Adam - Contenu réel
const historyTimeline = [
  {
    year: 'XIIe siècle',
    period: 'Origines',
    title: 'Villari Adam',
    description: 'Le village apparaît dans les textes sous le nom de « Villari Adam », signifiant le domaine d\'Adam, du nom d\'un chevalier au service de l\'Abbaye du Val voisine.',
  },
  {
    year: 'Moyen Âge',
    period: 'Abbaye du Val',
    title: 'Influence cistercienne',
    description: 'L\'Abbaye du Val, fondée en 1125, exerce une influence majeure sur le développement du village. Les moines cisterciens défrichent et cultivent les terres environnantes.',
  },
  {
    year: 'XIXe siècle',
    period: 'Carrières',
    title: 'Exploitation des carrières',
    description: 'L\'exploitation des carrières de pierres calcaires devient une activité économique importante. Ces pierres serviront notamment à la construction de bâtiments parisiens.',
  },
  {
    year: '1900-1922',
    period: 'Aristide Quillet',
    title: 'L\'ère Quillet',
    description: 'Aristide Quillet, célèbre éditeur parisien, devient maire et transforme le village. Il fait construire des infrastructures modernes et améliore la vie des habitants.',
  },
  {
    year: '1995',
    period: 'PNR',
    title: 'Parc naturel régional',
    description: 'Villiers-Adam intègre le Parc naturel régional du Vexin français, garantissant la préservation de son patrimoine naturel et bâti exceptionnel.',
  },
];

// Personnalités illustres
const personnalites = [
  {
    id: 'godard',
    nom: 'Benjamin Godard',
    dates: '1849–1895',
    titre: 'Compositeur',
    icon: Music,
    portrait: '/images/patrimoine/godard.jpg',
    color: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900',
    biographie: 'Benjamin Godard est né à Paris mais a passé une partie de sa vie à Villiers-Adam, où il trouvait l\'inspiration pour ses compositions. Violoniste virtuose et compositeur prolifique, il est l\'auteur de l\'opéra « Le Tasse » (1878), de la célèbre « Symphonie orientale » et de nombreuses œuvres pour violon. Sa « Berceuse de Jocelyn » reste l\'une des mélodies les plus connues du répertoire romantique français.',
    oeuvres: [
      'Le Tasse (opéra, 1878)',
      'Symphonie orientale',
      'Concerto romantique pour violon',
      'Berceuse de Jocelyn',
    ],
  },
  {
    id: 'quillet',
    nom: 'Aristide Quillet',
    dates: '1880–1955',
    titre: 'Éditeur & Maire',
    icon: BookOpen,
    portrait: '/images/patrimoine/quillet.jpg',
    color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900',
    biographie: 'Aristide Quillet, fondateur des éditions Quillet à Paris, fut maire de Villiers-Adam pendant 22 ans (1900–1922). Il a profondément marqué le village par ses réalisations : construction de l\'école, amélioration des chemins, installation de l\'éclairage public. Homme de progrès et de culture, il a allié son succès d\'éditeur à un engagement local exemplaire.',
    realisations: [
      'Maire pendant 22 ans',
      'Construction de l\'école',
      'Modernisation du village',
      'Fondateur des Éditions Quillet',
    ],
  },
];

// Église Saint-Sulpice
const eglise = {
  nom: 'Église Saint-Sulpice',
  style: 'Gothique flamboyant',
  siecle: 'XVIe siècle',
  protection: 'Monument historique (1927)',
  description: 'L\'église Saint-Sulpice de Villiers-Adam est un joyau du gothique flamboyant du Val-d\'Oise. Construite au XVIe siècle, elle a été classée Monument historique en 1927. Son architecture remarquable témoigne du savoir-faire des bâtisseurs de l\'époque. Le portail sculpté, les voûtes élancées et les vitraux anciens en font un lieu de visite incontournable.',
  caracteristiques: [
    'Portail sculpté du XVIe siècle',
    'Voûtes en croisée d\'ogives',
    'Clocher carré caractéristique',
    'Vitraux anciens restaurés',
    'Mobilier liturgique classé',
  ],
};

const HISTORIC_IMAGE_FILES = [
  'ancienne-mairie.jpg',
  'eglise-ancienne.jpg',
  'rue_de_bethemont.jpg',
  'rue_de_leglise.jpg',
  'rue_rivalaises.jpg',
  'rue_victor_hugo.jpg',
] as const;

type HistoricImageFile = (typeof HISTORIC_IMAGE_FILES)[number];

const historicGalleryMetadata: Record<
  HistoricImageFile,
  {
    title: string;
    description: string;
    alt: string;
  }
> = {
  'ancienne-mairie.jpg': {
    title: 'Ancienne mairie',
    description: 'Ancien bâtiment de la mairie de Villiers-Adam.',
    alt: 'Ancienne mairie de Villiers-Adam sur photographie historique',
  },
  'eglise-ancienne.jpg': {
    title: 'Église Saint-Sulpice',
    description: 'Vue d’archive de l’église Saint-Sulpice et de ses abords.',
    alt: 'Église Saint-Sulpice de Villiers-Adam sur photographie ancienne',
  },
  'rue_de_bethemont.jpg': {
    title: 'Rue de Béthemont',
    description: 'La rue de Béthemont telle qu’elle apparaissait autrefois.',
    alt: 'Rue de Béthemont à Villiers-Adam sur photographie d’archive',
  },
  'rue_de_leglise.jpg': {
    title: 'Rue de l’Église',
    description: 'Perspective historique de la rue de l’Église.',
    alt: 'Rue de l’Église à Villiers-Adam sur photographie ancienne',
  },
  'rue_rivalaises.jpg': {
    title: 'Rue Rivalaises',
    description: 'Vue ancienne de la rue Rivalaises et de ses habitations.',
    alt: 'Rue Rivalaises à Villiers-Adam sur photographie d’époque',
  },
  'rue_victor_hugo.jpg': {
    title: 'Rue Victor-Hugo',
    description: 'Rue Victor-Hugo dans le Villiers-Adam du début du XXe siècle.',
    alt: 'Rue Victor-Hugo à Villiers-Adam sur photographie d’archive',
  },
};

const historicGallery = HISTORIC_IMAGE_FILES.map((file, index) => ({
  id: index,
  image: `/images/vieux_villiers-adam/${file}`,
  ...historicGalleryMetadata[file],
}));

function FallbackImage({ alt, fallbackIcon: Icon = Landmark, ...props }: ImageProps & { fallbackIcon?: React.ElementType }) {
  const [error, setError] = React.useState(false);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-villiers-stone to-villiers-cream">
        <Icon className="h-16 w-16 text-villiers-blue/20" />
      </div>
    );
  }

  return <Image {...props} alt={alt} onError={() => setError(true)} />;
}

export default function PatrimoinePage() {
  const prefersReducedMotion = useReducedMotion();
  const { reducedMotion: userReducedMotion } = useAccessibility();
  const reducedMotion = prefersReducedMotion || userReducedMotion;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: historicGallery.length > 1,
    align: 'start',
    duration: reducedMotion ? 20 : 28,
  });
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(historicGallery.length > 1);
  const hasMultipleImages = historicGallery.length > 1;

  const onScrollPrev = React.useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const onScrollNext = React.useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const onDotClick = React.useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  const onGalleryKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (!hasMultipleImages) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onScrollPrev();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onScrollNext();
    }
  }, [hasMultipleImages, onScrollNext, onScrollPrev]);

  React.useEffect(() => {
    if (!emblaApi) return;

    const updateNavigationState = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    updateNavigationState();
    emblaApi.on('select', updateNavigationState);
    emblaApi.on('reInit', updateNavigationState);

    return () => {
      emblaApi.off('select', updateNavigationState);
      emblaApi.off('reInit', updateNavigationState);
    };
  }, [emblaApi]);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-green/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
              <Link href="/culture-loisirs">
                <ChevronLeft className="h-4 w-4" />
                Retour à Culture & Loisirs
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
              <span className="w-8 h-px bg-villiers-gold" />
              Culture & Loisirs
            </span>
            <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">
              Notre <span className="display-italic">patrimoine</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Découvrez l&apos;histoire millénaire de Villiers-Adam, ses personnalités illustres
              et son patrimoine architectural remarquable au cœur du Vexin français.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Église Saint-Sulpice - Section mise en avant */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-organic overflow-hidden">
              <FallbackImage
                src="/images/eglise.jpg"
                alt="Église Saint-Sulpice de Villiers-Adam, joyau du gothique flamboyant classé Monument historique depuis 1927"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                fallbackIcon={Church}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 bg-villiers-gold/90 text-white text-xs font-medium rounded-full">
                  Monument historique
                </span>
                <span className="px-3 py-1 bg-white/90 text-villiers-blue text-xs font-medium rounded-full">
                  1927
                </span>
              </div>
            </div>

            {/* Contenu */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-villiers-gold/10 border border-villiers-gold/20 flex items-center justify-center">
                  <Church className="h-6 w-6 text-villiers-gold" />
                </div>
                <div>
                  <span className="text-sm font-mono text-villiers-gold">{eglise.siecle}</span>
                  <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                    {eglise.nom}
                  </h2>
                </div>
              </div>

              <p className="text-lg font-medium text-villiers-blue dark:text-villiers-gold mb-4">
                {eglise.style}
              </p>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {eglise.description}
              </p>

              <div className="bg-background rounded-lg p-4 border border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-3">Caractéristiques</h3>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {eglise.caracteristiques.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-villiers-gold mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline historique */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-villiers-gold" />
              <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                Histoire de Villiers-Adam
              </h2>
            </div>
            <p className="text-muted-foreground">
              Du chevalier Adam au Parc naturel régional, découvrez les grandes étapes
              qui ont façonné notre commune.
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-villiers-gold via-villiers-blue to-villiers-green" />

            <div className="space-y-12">
              {historyTimeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    'relative grid md:grid-cols-2 gap-8 md:gap-16',
                    index % 2 === 0 ? 'md:text-right' : 'md:flex-row-reverse'
                  )}
                >
                  {/* Point sur la timeline */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-4 border-villiers-gold" />

                  {/* Contenu */}
                  <div className={cn(
                    'ml-16 md:ml-0',
                    index % 2 === 0 ? 'md:pr-16' : 'md:col-start-2 md:pl-16 md:text-left'
                  )}>
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm text-villiers-gold">{item.period}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono text-lg font-bold text-foreground">{item.year}</span>
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Personnalités illustres */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-villiers-gold" />
              <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                Personnalités illustres
              </h2>
            </div>
            <p className="text-muted-foreground">
              Villiers-Adam a vu passer des personnalités remarquables qui ont marqué
              l&apos;histoire de la commune et au-delà.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {personnalites.map((personne, index) => (
              <motion.article
                key={personne.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background border border-border/50 rounded-organic overflow-hidden hover:border-villiers-gold/30 transition-colors"
              >
                <div className="p-6 lg:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center border shrink-0',
                      personne.color
                    )}>
                      <personne.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-muted-foreground">{personne.dates}</span>
                      <h3 className="text-xl font-heading font-semibold text-foreground">
                        {personne.nom}
                      </h3>
                      <span className="text-sm text-villiers-gold font-medium">{personne.titre}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {personne.biographie}
                  </p>

                  {/* Oeuvres ou Réalisations */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                      {personne.id === 'godard' ? 'Oeuvres principales' : 'Réalisations'}
                    </h4>
                    <ul className="space-y-1">
                      {(personne.oeuvres || personne.realisations)?.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="w-1 h-1 rounded-full bg-villiers-gold" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Galerie d'images anciennes */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Landmark className="h-6 w-6 text-villiers-gold" />
              <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                Galerie historique
              </h2>
            </div>
            <p className="text-muted-foreground">
              Plongez dans le passé de Villiers-Adam à travers ces images d&apos;archives.
            </p>
          </motion.div>

          <section
            aria-label="Galerie historique de Villiers-Adam"
            aria-roledescription="carousel"
            className="space-y-5"
            onKeyDown={onGalleryKeyDown}
            tabIndex={0}
          >
            <div className="relative overflow-hidden rounded-organic border border-border/50 bg-muted/20">
              <div ref={emblaRef} className="overflow-hidden">
                <div className="flex touch-pan-y">
                  {historicGallery.map((image) => (
                    <div key={image.id} className="min-w-0 flex-[0_0_100%]">
                      <figure className="relative">
                        <div className="relative aspect-[16/10]">
                          <FallbackImage
                            src={image.image}
                            alt={image.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1100px"
                          />
                        </div>
                        <figcaption className="border-t border-border/60 bg-background/95 px-4 py-3 sm:px-6">
                          <p className="text-sm font-semibold text-foreground sm:text-base">
                            {image.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {image.description}
                          </p>
                        </figcaption>
                      </figure>
                    </div>
                  ))}
                </div>
              </div>

              {hasMultipleImages && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={onScrollPrev}
                    disabled={!canScrollPrev}
                    className="absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full shadow-md"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={onScrollNext}
                    disabled={!canScrollNext}
                    className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full shadow-md"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {hasMultipleImages && (
              <>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {historicGallery.map((image, index) => (
                    <button
                      key={`${image.id}-dot`}
                      type="button"
                      onClick={() => onDotClick(index)}
                      aria-label={`Afficher ${image.title}`}
                      aria-current={index === activeIndex}
                      className={cn(
                        'h-2.5 w-2.5 rounded-full transition-colors',
                        index === activeIndex ? 'bg-villiers-gold' : 'bg-villiers-gold/30 hover:bg-villiers-gold/60'
                      )}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {historicGallery.map((image, index) => (
                    <button
                      key={`${image.id}-thumb`}
                      type="button"
                      onClick={() => onDotClick(index)}
                      className={cn(
                        'group overflow-hidden rounded-lg border transition',
                        index === activeIndex
                          ? 'border-villiers-gold ring-1 ring-villiers-gold'
                          : 'border-border/60 hover:border-villiers-gold/40'
                      )}
                      aria-label={`Sélectionner la miniature ${image.title}`}
                      aria-current={index === activeIndex}
                    >
                      <div className="relative aspect-[4/3]">
                        <FallbackImage
                          src={image.image}
                          alt={image.alt}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 30vw, 12vw"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Note */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Ces images proviennent des archives communales et de collections privées.
            Si vous possédez des photos anciennes de Villiers-Adam, n&apos;hésitez pas à nous contacter.
          </p>
        </div>
      </section>

      {/* Autres lieux */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-6 w-6 text-villiers-gold" />
              <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                Autres lieux remarquables
              </h2>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-5 bg-background border border-border/50 rounded-organic"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-villiers-green/10 flex items-center justify-center">
                  <TreePine className="h-5 w-5 text-villiers-green" />
                </div>
                <h3 className="font-heading font-semibold text-foreground">Forêt de L&apos;Isle-Adam</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Plus de 1 500 hectares de forêt domaniale aux portes du village.
                Chênes centenaires, sentiers balisés et faune préservée.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-5 bg-background border border-border/50 rounded-organic"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-villiers-blue/10 flex items-center justify-center">
                  <Landmark className="h-5 w-5 text-villiers-blue" />
                </div>
                <h3 className="font-heading font-semibold text-foreground">Le lavoir communal</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Ancien lavoir restauré, témoin de la vie quotidienne d&apos;autrefois.
                Situé près de la source qui alimentait le village.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-5 bg-background border border-border/50 rounded-organic"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center dark:bg-amber-900/30">
                  <Mountain className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-heading font-semibold text-foreground">Les anciennes carrières</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Vestiges des carrières de pierre calcaire exploitées au XIXe siècle.
                Un patrimoine industriel méconnu.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
