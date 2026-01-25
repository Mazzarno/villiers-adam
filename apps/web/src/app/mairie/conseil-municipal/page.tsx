'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, Crown, Users, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api, { type CouncilMember } from '@/lib/api';

const roleLabels: Record<CouncilMember['role'], string> = {
  MAIRE: 'Maire',
  ADJOINT: 'Adjoint',
  CONSEILLER: 'Conseiller municipal',
  CONSEILLER_DELEGUE: 'Conseiller délégué',
};

export default function ConseilMunicipalPage() {
  const [members, setMembers] = React.useState<CouncilMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await api.council.list();
        const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setMembers(sorted);
      } catch (error) {
        console.error('Failed to load council members:', error);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const maire = members.find((member) => member.role === 'MAIRE');
  const adjoints = members.filter((member) => member.role === 'ADJOINT');
  const delegues = members.filter((member) => member.role === 'CONSEILLER_DELEGUE');
  const conseillers = members.filter((member) => member.role === 'CONSEILLER');

  return (
    <div className="min-h-screen">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-villiers-blue/5 to-background" />
        <div className="absolute inset-0 texture-grain opacity-30" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
              <Link href="/mairie">
                <ChevronLeft className="h-4 w-4" />
                Retour à La Mairie
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
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
          </motion.div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container space-y-12">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
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

              {adjoints.length > 0 && (
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-villiers-blue" />
                    Les Adjoints au Maire
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {adjoints.map((adjoint) => (
                      <div
                        key={adjoint.id}
                        className="p-5 bg-background border border-border/50 rounded-organic hover:border-villiers-blue/30 transition-colors"
                      >
                        <p className="text-xs font-medium text-villiers-gold uppercase tracking-wide">
                          {roleLabels[adjoint.role]}
                        </p>
                        <h3 className="font-heading font-semibold text-foreground mt-1">
                          {adjoint.name}
                        </h3>
                        {adjoint.delegations && (
                          <p className="text-sm text-muted-foreground mt-2">{adjoint.delegations}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {delegues.length > 0 && (
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                    Conseillers délégués
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {delegues.map((member) => (
                      <div key={member.id} className="p-5 bg-background border border-border/50 rounded-organic">
                        <p className="text-xs font-medium text-villiers-gold uppercase tracking-wide">
                          {roleLabels[member.role]}
                        </p>
                        <h3 className="font-heading font-semibold text-foreground mt-1">
                          {member.name}
                        </h3>
                        {member.delegations && (
                          <p className="text-sm text-muted-foreground mt-2">{member.delegations}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {conseillers.length > 0 && (
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                    Conseillers municipaux
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {conseillers.map((member) => (
                      <div key={member.id} className="p-4 bg-muted/30 rounded-organic">
                        <p className="font-medium text-foreground">{member.name}</p>
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
