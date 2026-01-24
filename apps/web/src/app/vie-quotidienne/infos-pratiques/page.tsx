'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Phone,
  Trash2,
  Bus,
  AlertTriangle,
  Clock,
  MapPin,
  ChevronRight,
  Volume2,
  Dog,
  Leaf,
  Recycle,
  Calendar,
  Hammer,
  Flame,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Sommaire des sections
const sections = [
  { id: 'urgences', label: 'Urgences', icon: AlertTriangle },
  { id: 'dechets', label: 'Déchets', icon: Trash2 },
  { id: 'transports', label: 'Transports', icon: Bus },
  { id: 'regles', label: 'Règles de vie', icon: Volume2 },
];

// Numéros d'urgence
const emergencyNumbers = [
  { name: 'SAMU', number: '15', description: 'Urgence médicale' },
  { name: 'Pompiers', number: '18', description: 'Incendie, accident' },
  { name: 'Police', number: '17', description: 'Urgence police' },
  { name: 'Numéro unique', number: '112', description: 'Urgence européenne' },
  { name: 'Gendarmerie L\'Isle-Adam', number: '01 34 08 00 17', description: 'Gendarmerie de proximité' },
  { name: 'Pharmacie de garde', number: '3237', description: 'Pharmacie la plus proche' },
];

// Collectes déchets
const wasteCollection = [
  {
    type: 'Ordures ménagères',
    icon: Trash2,
    schedule: 'Mardi et vendredi matin',
    color: 'bg-gray-600',
    details: 'Bacs gris - sortir la veille au soir',
  },
  {
    type: 'Tri sélectif',
    icon: Recycle,
    schedule: 'Mercredi matin',
    color: 'bg-yellow-500',
    details: 'Bacs jaunes - emballages, papiers, cartons',
  },
  {
    type: 'Verre',
    icon: Leaf,
    schedule: 'Points d\'apport volontaire',
    color: 'bg-green-600',
    details: 'Conteneurs disponibles place de la Mairie',
  },
];

export default function InfosPratiquesPage() {
  const [activeSection, setActiveSection] = React.useState<string | null>(null);

  // Observer pour détecter la section active
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
              <span className="w-8 h-px bg-villiers-gold" />
              Vie quotidienne
            </span>
            <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground mb-6">
              Infos <span className="display-italic">pratiques</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Toutes les informations utiles pour votre quotidien à Villiers-Adam :
              numéros d&apos;urgence, collecte des déchets, transports et règles de vie collective.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Layout avec sommaire sticky */}
      <div className="container pb-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Sommaire sticky */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <nav className="p-4 bg-muted/30 rounded-organic border border-border/50">
                <h2 className="font-heading font-semibold text-foreground mb-4">
                  Sommaire
                </h2>
                <ul className="space-y-1">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                          activeSection === section.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <section.icon className="h-4 w-4" />
                        {section.label}
                        <ChevronRight className={cn(
                          'h-3 w-3 ml-auto transition-transform',
                          activeSection === section.id && 'translate-x-1'
                        )} />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Contenu principal */}
          <main className="lg:col-span-9 space-y-16">
            {/* Section Urgences */}
            <section id="urgences" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                    Numéros d&apos;urgence
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {emergencyNumbers.map((item, index) => (
                    <motion.a
                      key={item.number}
                      href={`tel:${item.number.replace(/\s/g, '')}`}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group p-4 bg-background border border-border/50 rounded-organic hover:border-red-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-red-600 transition-colors">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </p>
                        </div>
                        <Phone className="h-4 w-4 text-muted-foreground group-hover:text-red-600 transition-colors" />
                      </div>
                      <p className="font-mono text-xl font-bold text-red-600 mt-3">
                        {item.number}
                      </p>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* Section Déchets */}
            <section id="dechets" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-villiers-green/10 border border-villiers-green/20 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-villiers-green" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                    Collecte des déchets
                  </h2>
                </div>

                <div className="space-y-4 mb-8">
                  {wasteCollection.map((item, index) => (
                    <motion.div
                      key={item.type}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-background border border-border/50 rounded-organic"
                    >
                      <div className={cn('w-4 h-12 rounded-full', item.color)} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold text-foreground">{item.type}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium text-villiers-green">
                          <Calendar className="h-3.5 w-3.5" />
                          {item.schedule}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 bg-muted/30 rounded-organic border border-border/50">
                  <h4 className="font-semibold text-foreground mb-2">Déchetterie</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Les habitants peuvent se rendre à la déchetterie intercommunale de Mériel.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      Rue des Marais, Mériel
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Mar-Sam : 9h-12h / 14h-18h
                    </span>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section Transports */}
            <section id="transports" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-villiers-blue/10 border border-villiers-blue/20 flex items-center justify-center">
                    <Bus className="h-6 w-6 text-villiers-blue" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                    Transports
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 bg-background border border-border/50 rounded-organic">
                    <h3 className="font-semibold text-foreground mb-3">Bus - Ligne 95-07</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Liaison vers L&apos;Isle-Adam et les communes environnantes.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-villiers-blue">
                      <Clock className="h-4 w-4" />
                      Fréquence : toutes les 30 min en semaine
                    </div>
                  </div>

                  <div className="p-5 bg-background border border-border/50 rounded-organic">
                    <h3 className="font-semibold text-foreground mb-3">Gare SNCF</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Gare de Presles-Courcelles (ligne H) à 4 km.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-villiers-blue">
                      <MapPin className="h-4 w-4" />
                      Direction Paris-Nord en 45 min
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                  Pour plus d&apos;informations sur les horaires et itinéraires,
                  consultez le site <a href="https://www.iledefrance-mobilites.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Île-de-France Mobilités</a>.
                </p>
              </motion.div>
            </section>

            {/* Section Règles de vie */}
            <section id="regles" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-villiers-gold/10 border border-villiers-gold/20 flex items-center justify-center">
                    <Volume2 className="h-6 w-6 text-villiers-gold" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-heading font-semibold text-foreground">
                    Règles de vie
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Bruits de jardinage / tapage */}
                  <div className="p-5 bg-background border border-border/50 rounded-organic">
                    <div className="flex items-center gap-3 mb-3">
                      <Volume2 className="h-5 w-5 text-villiers-gold" />
                      <h3 className="font-semibold text-foreground">Bruits de jardinage / tapage</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Les bruits de jardinage ou de travaux sonores sont autorisés :
                    </p>
                    <div className="bg-muted/30 rounded-lg p-3 mb-3">
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex justify-between">
                          <span>Jours ouvrés</span>
                          <span className="font-mono">8h30–12h et 14h30–19h30</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Samedis</span>
                          <span className="font-mono">9h–12h et 15h–19h</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Dimanches et jours fériés</span>
                          <span className="font-mono">10h–12h</span>
                        </li>
                      </ul>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Tous les bruits causés sans nécessité ou par défaut de précaution entraînant une gêne
                      pour le voisinage sont interdits, et en particulier <strong className="text-foreground">entre 22h et 7h</strong>.
                      En tout état de cause, veillez à respecter les horaires de vos voisins.
                    </p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-3.5 w-3.5" />
                      Arrêté municipal nuisances
                    </Button>
                  </div>

                  {/* Construction / démolition */}
                  <div className="p-5 bg-background border border-border/50 rounded-organic">
                    <div className="flex items-center gap-3 mb-3">
                      <Hammer className="h-5 w-5 text-villiers-blue" />
                      <h3 className="font-semibold text-foreground">Construction / démolition</h3>
                    </div>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        <strong className="text-foreground">Dépôt de matériaux :</strong> Tout dépôt de sable, gravats, matériaux, etc.,
                        ainsi que d&apos;une benne à gravats, doit faire l&apos;objet d&apos;une demande d&apos;autorisation en Mairie.
                      </p>
                      <p>
                        <strong className="text-foreground">Permis de construire :</strong> Obligatoire pour toute construction neuve,
                        extension de plus de 20m², surélévation, changement d&apos;affectation de locaux,
                        création de niveaux supplémentaires, installation de locaux dépourvus de fondations.
                      </p>
                      <p>
                        <strong className="text-foreground">Déclaration préalable :</strong> Pour les clôtures et tous autres travaux
                        exemptés du permis de construire (modifications et ravalement de façade, extension de faible importance).
                      </p>
                      <p>
                        <strong className="text-foreground">Permis de démolir :</strong> Pour toute démolition, il doit être établi une demande de permis de démolir.
                      </p>
                    </div>
                  </div>

                  {/* Brûlage des déchets */}
                  <div className="p-5 bg-red-50/50 border border-red-200/50 rounded-organic dark:bg-red-950/20 dark:border-red-900/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Flame className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-foreground">Brûlage des déchets</h3>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                      Le brûlage des déchets est interdit.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Les déchets verts peuvent être déposés à la déchetterie ou compostés.
                    </p>
                  </div>

                  {/* Animaux */}
                  <div className="p-5 bg-background border border-border/50 rounded-organic">
                    <div className="flex items-center gap-3 mb-3">
                      <Dog className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">Animaux de compagnie</h3>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Les chiens doivent être tenus en laisse sur la voie publique</li>
                      <li>• Les déjections canines doivent être ramassées</li>
                      <li>• Des sacs sont disponibles en mairie</li>
                    </ul>
                  </div>

                  {/* Entretien */}
                  <div className="p-5 bg-background border border-border/50 rounded-organic">
                    <div className="flex items-center gap-3 mb-3">
                      <Leaf className="h-5 w-5 text-villiers-green" />
                      <h3 className="font-semibold text-foreground">Entretien des propriétés</h3>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Les haies en limite de voie publique doivent être taillées régulièrement</li>
                      <li>• Les trottoirs doivent être maintenus propres devant les propriétés</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-villiers-blue/5 border border-villiers-blue/20 rounded-organic">
                  <p className="text-sm text-muted-foreground">
                    Pour toute question ou signalement, contactez la mairie au{' '}
                    <a href="tel:0134699287" className="font-mono text-primary hover:underline">01 34 69 92 87</a>{' '}
                    ou par email à{' '}
                    <a href="mailto:mairie@villiers-adam.fr" className="text-primary hover:underline">mairie@villiers-adam.fr</a>.
                  </p>
                </div>
              </motion.div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
