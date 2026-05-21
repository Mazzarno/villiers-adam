import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container py-24 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-9xl font-heading font-bold text-primary/20 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
          Page non trouvée
        </h2>
        <p className="text-muted-foreground mb-8">
          Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
