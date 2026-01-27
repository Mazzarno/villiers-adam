import { Metadata } from 'next';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoomsList } from '@/components/reservations/rooms-list';

export const metadata: Metadata = {
  title: 'Réservation de salles',
  description: 'Réservez les salles communales de Villiers-Adam pour vos événements.',
};

export default function ReservationsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Réservation de salles
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            La commune de Villiers-Adam met à disposition plusieurs salles pour vos événements privés ou associatifs.
          </p>
        </div>
      </section>

      {/* Info banner */}
      <section className="bg-secondary/10 border-b">
        <div className="container py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Comment réserver ?</p>
              <p className="text-muted-foreground">
                Sélectionnez une salle, vérifiez les disponibilités et remplissez le formulaire de demande.
                Votre réservation sera validée par les services de la mairie sous 48h.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms list */}
      <section className="container py-12">
        <RoomsList />
      </section>

      {/* Conditions */}
      <section className="bg-muted/50 py-12">
        <div className="container">
          <h2 className="font-heading text-2xl font-semibold mb-6">
            Conditions de réservation
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documents à fournir</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Pièce d&apos;identité du responsable
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Justificatif de domicile
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Attestation d&apos;assurance responsabilité civile
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Pour les associations : statuts et récépissé de déclaration
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Modalités de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Acompte de 30% à la réservation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Solde 15 jours avant l&apos;événement
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Caution de 300€ (chèque non encaissé)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Paiement par chèque ou virement
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="container py-12">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h3 className="font-heading text-2xl font-semibold mb-4">
              Une question sur les réservations ?
            </h3>
            <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
              Contactez le secrétariat de mairie pour toute demande d&apos;information sur les salles communales.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
