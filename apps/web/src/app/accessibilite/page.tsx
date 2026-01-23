import { Metadata } from 'next';
import { AccessibilityPanel } from '@/components/accessibility/accessibility-panel';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Accessibilité',
  description: 'Paramètres d\'accessibilité et déclaration de conformité RGAA du site de Villiers-Adam.',
};

const accessibilityFeatures = [
  'Navigation au clavier complète',
  'Compatibilité avec les lecteurs d\'écran',
  'Textes alternatifs pour les images',
  'Contrastes de couleurs conformes WCAG 2.1 AA',
  'Structure des pages avec des titres hiérarchiques',
  'Liens explicites et descriptifs',
  'Formulaires avec labels associés',
  'Mode sombre pour réduire la fatigue oculaire',
  'Mode senior avec texte agrandi',
  'Mode dyslexie avec police adaptée',
];

export default function AccessibilitePage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Accessibilité
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            Le site de Villiers-Adam s'engage à rendre ses services accessibles à tous les citoyens.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Settings panel */}
          <div>
            <h2 className="font-heading text-2xl font-semibold mb-6">
              Personnaliser l'affichage
            </h2>
            <AccessibilityPanel />
          </div>

          {/* Info */}
          <div className="space-y-8">
            {/* Features */}
            <div>
              <h2 className="font-heading text-2xl font-semibold mb-6">
                Fonctionnalités d'accessibilité
              </h2>
              <Card>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {accessibilityFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* RGAA declaration */}
            <div>
              <h2 className="font-heading text-2xl font-semibold mb-6">
                Déclaration d'accessibilité
              </h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    La commune de Villiers-Adam s'engage à rendre son site internet
                    accessible conformément à l'article 47 de la loi n° 2005-102 du
                    11 février 2005.
                  </p>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium mb-2">État de conformité</p>
                    <p className="text-sm text-muted-foreground">
                      Ce site est <strong>partiellement conforme</strong> au référentiel
                      général d'amélioration de l'accessibilité (RGAA) version 4.1.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Contenus non accessibles</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Certains documents PDF non accessibles</li>
                      <li>Vidéos sans sous-titres</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Établissement de cette déclaration</p>
                    <p className="text-sm text-muted-foreground">
                      Cette déclaration a été établie le 1er janvier 2025.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact */}
            <div>
              <h2 className="font-heading text-2xl font-semibold mb-6">
                Signaler un problème
              </h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Si vous rencontrez un défaut d'accessibilité vous empêchant
                    d'accéder à un contenu ou une fonctionnalité du site, veuillez
                    nous le signaler.
                  </p>

                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Par email :</strong>{' '}
                      <a href="mailto:mairie@villiers-adam.fr" className="text-primary hover:underline">
                        mairie@villiers-adam.fr
                      </a>
                    </p>
                    <p>
                      <strong>Par téléphone :</strong>{' '}
                      <a href="tel:+33134089000" className="text-primary hover:underline">
                        01 34 08 90 00
                      </a>
                    </p>
                    <p>
                      <strong>Par courrier :</strong><br />
                      Mairie de Villiers-Adam<br />
                      1 Place de la Mairie<br />
                      95840 Villiers-Adam
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* External links */}
            <div>
              <h2 className="font-heading text-2xl font-semibold mb-6">
                Ressources
              </h2>
              <Card>
                <CardContent className="p-6 space-y-3">
                  <a
                    href="https://accessibilite.numerique.gouv.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    RGAA - Référentiel Général d'Amélioration de l'Accessibilité
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href="https://www.defenseurdesdroits.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Défenseur des droits
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
