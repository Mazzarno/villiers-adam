import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité du site officiel de la commune de Villiers-Adam.',
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Politique de confidentialité
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            Informations sur la collecte et le traitement des données personnelles.
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
              Ce texte constitue une base informative. Il doit être validé par la municipalité et
              le référent juridique/RGPD avant publication définitive.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Données traitées</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Le site peut traiter des données fournies volontairement via formulaires, notamment:
              nom, courriel, téléphone, message.
            </p>
            <p>
              Certaines données techniques (journaux applicatifs, sécurité, anti-spam) peuvent être
              traitées pour assurer le bon fonctionnement du service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Finalités</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>Répondre aux demandes adressées à la mairie</li>
              <li>Gérer les inscriptions à la newsletter communale</li>
              <li>Assurer la sécurité et la disponibilité du service en ligne</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Droits des personnes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Conformément au RGPD, vous disposez de droits d&apos;accès, de rectification,
              d&apos;effacement, de limitation et d&apos;opposition.
            </p>
            <p>
              Contact DPO / référent RGPD: à confirmer par la municipalité.
            </p>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          Pour toute demande relative aux données personnelles, utilisez le formulaire de{' '}
          <Link href="/contact" className="text-primary hover:underline">
            contact
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
