import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Crown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api, { type CouncilMember } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Conseil Municipal',
  description: 'Découvrez l\'équipe municipale de Villiers-Adam qui représente la commune et pilote les projets locaux.',
};

const roleLabels: Record<CouncilMember['role'], string> = {
  MAIRE: 'Maire',
  ADJOINT: 'Adjoint',
  CONSEILLER: 'Conseiller',
  CONSEILLER_DELEGUE: 'Conseiller délégué',
};

const getDisplayRole = (member: CouncilMember) => {
  const roleTitle = member.roleTitle?.trim();
  if (roleTitle) return roleTitle;
  return roleLabels[member.role];
};

export default async function ConseilMunicipalPage() {
  let members: CouncilMember[] = [];
  let hasError = false;

  try {
    const data = await api.council.list();
    members = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (error) {
    console.error('Failed to load council members:', error);
    hasError = true;
  }
  const hasLiveData = members.length > 0;

  const maire = members.find((member) => member.role === 'MAIRE');
  const otherMembers = members.filter((member) => member.id !== maire?.id);

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
              <Link href="/mairie">
                <ChevronLeft className="h-4 w-4" />
                Retour à La Mairie
              </Link>
            </Button>
          </div>

          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-villiers-blue/10 border border-villiers-blue/20 flex items-center justify-center">
                <Users className="h-8 w-8 text-villiers-blue" />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-1">
                  <span className="w-8 h-px bg-villiers-gold" />
                  La Mairie
                </span>
                <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
                  Le Conseil Municipal
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Découvrez l&apos;équipe municipale qui représente la commune et pilote les projets locaux.
            </p>
          </div>
        </div>
      </section>

      {/* Bandeau statique */}
      <section className="border-b border-border/50 bg-villiers-blue/5">
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-foreground font-medium">
                Le conseil municipal de Villiers-Adam compte 15 membres (1 maire + 14 conseillers).
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Les seances du conseil municipal sont publiques et se tiennent en general une fois par trimestre.
                Les comptes-rendus sont consultables dans la rubrique{' '}
                <Link href="/publications/comptes-rendus" className="text-primary hover:underline">
                  Publications
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container space-y-12">
          {hasError && (
            <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
              Les informations sont temporairement indisponibles.
            </div>
          )}
          {!hasError && !hasLiveData && (
            <div className="p-4 rounded-organic border border-villiers-gold/25 bg-villiers-gold/5 text-sm text-muted-foreground">
              Aucune donnee publiee pour le moment.
            </div>
          )}
          {!hasError && hasLiveData && (
            <>
            {maire && (
              <div className="bg-gradient-to-br from-villiers-blue/5 to-villiers-gold/5 border border-villiers-gold/20 rounded-organic overflow-hidden">
                <div className="p-8 lg:p-10">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-xl bg-villiers-blue/10 border border-villiers-blue/20 flex items-center justify-center shrink-0 overflow-hidden">
                      {maire.photo ? (
                        <Image src={maire.photo} alt={maire.name} width={160} height={160} className="object-cover" />
                      ) : (
                        <Crown className="h-12 w-12 text-villiers-gold" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-villiers-gold/10 text-villiers-gold text-sm font-medium rounded-full">
                          Maire
                        </span>
                      </div>
                      <h2 className="font-heading text-3xl font-semibold text-foreground mb-2">
                        {maire.name}
                      </h2>
                      {maire.delegations && (
                        <p className="text-lg text-villiers-blue dark:text-villiers-gold font-medium mb-4">
                          {maire.delegations}
                        </p>
                      )}
                      {maire.bio && (
                        <p className="text-muted-foreground">{maire.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {otherMembers.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                  Membres du conseil
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherMembers.map((member) => (
                    <div key={member.id} className="p-4 bg-background border border-border/50 rounded-organic">
                      <div className="flex items-start gap-3">
                        <div className="h-14 w-14 rounded-lg bg-muted/50 border border-border/60 overflow-hidden shrink-0 flex items-center justify-center">
                          {member.photo ? (
                            <Image src={member.photo} alt={member.name} width={56} height={56} className="h-full w-full object-cover" />
                          ) : (
                            <Users className="h-6 w-6 text-villiers-blue/60" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-villiers-gold uppercase tracking-wide">
                            {getDisplayRole(member)}
                          </p>
                          <p className="font-medium text-foreground">{member.name}</p>
                        </div>
                      </div>
                      {member.delegations && (
                        <p className="text-sm text-muted-foreground mt-1">{member.delegations}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
