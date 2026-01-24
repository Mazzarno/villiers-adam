'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Landmark,
  Church,
  TreePine,
  Clock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  X,
  Music,
  BookOpen,
  Crown,
  Mountain,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

// Galerie d'images anciennes (à utiliser avec /images/vieux_villiers-adam/)
const historicGallery = [
  {
    id: 1,
    title: 'Vue du village (début XXe)',
    description: 'Le village au temps d\'Aristide Quillet.',
    image: '/images/vieux_villiers-adam/village-1900.jpg',
  },
  {
    id: 2,
    title: 'L\'église Saint-Sulpice',
    description: 'L\'église et son parvis au début du siècle.',
    image: '/images/vieux_villiers-adam/eglise-ancienne.jpg',
  },
  {
    id: 3,
    title: 'La Grande Rue',
    description: 'La rue principale avec ses commerces d\'antan.',
    image: '/images/vieux_villiers-adam/grande-rue.jpg',
  },
  {
    id: 4,
    title: 'Les carrières',
    description: 'L\'exploitation des carrières de pierre.',
    image: '/images/vieux_villiers-adam/carrieres.jpg',
  },
];

export default function PatrimoinePage() {
  const [selectedImage, setSelectedImage] = React.useState<number | null>(null);
  const [selectedPersonnalite, setSelectedPersonnalite] = React.useState<string | null>(null);

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
              <Image
                src="/images/eglise.jpg"
                alt="Église Saint-Sulpice de Villiers-Adam"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
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

          {/* Grille de la galerie */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {historicGallery.map((image, index) => (
              <motion.button
                key={image.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => setSelectedImage(image.id)}
                className="group relative aspect-square bg-muted rounded-organic overflow-hidden hover:ring-2 hover:ring-villiers-gold transition-all"
              >
                {/* Placeholder - en production, utiliser les vraies images */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-villiers-stone to-villiers-cream">
                  <Landmark className="h-12 w-12 text-villiers-blue/20" />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium truncate">{image.title}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

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

      {/* Modal galerie */}
      {selectedImage !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="h-8 w-8" />
          </button>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-3xl w-full bg-background rounded-organic overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Placeholder image agrandie */}
            <div className="aspect-video bg-muted flex items-center justify-center">
              <Landmark className="h-24 w-24 text-villiers-blue/20" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                {historicGallery.find((i) => i.id === selectedImage)?.title}
              </h3>
              <p className="text-muted-foreground">
                {historicGallery.find((i) => i.id === selectedImage)?.description}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
