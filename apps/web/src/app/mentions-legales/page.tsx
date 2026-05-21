import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site officiel de la commune de Villiers-Adam.',
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Mentions légales</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            Informations légales relatives au site officiel de la commune.
          </p>
        </div>
      </section>

      <section className="container py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Validation municipale requise</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              Ce contenu est un texte de travail publié en attendant validation juridique officielle
              de la mairie de Villiers-Adam.
            </p>
            <p>
              Les informations ci-dessous doivent être revues et validées avant publication
              définitive.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Éditeur du site</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Mairie de Villiers-Adam</p>
            <p>Place de la Mairie, 95840 Villiers-Adam</p>
            <p>Courriel: mairie@villiers-adam.fr</p>
            <p>Téléphone: 01 34 08 50 50</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hébergement</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Hébergeur: à confirmer par la municipalité</p>
            <p>Adresse: à confirmer par la municipalité</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Propriété intellectuelle</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Les contenus du site (textes, visuels, logos, éléments graphiques) sont protégés par
              le droit de la propriété intellectuelle.
            </p>
            <p>
              Toute réutilisation substantielle doit faire l&apos;objet d&apos;une autorisation
              préalable de la commune.
            </p>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          Besoin d&apos;une information complémentaire ?{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Contactez la mairie
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
