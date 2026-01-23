'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { History, RotateCcw, Loader2, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { versions, type Version } from '@/lib/api';
import { formatDateTime, getInitials } from '@/lib/utils';

interface VersionHistoryProps {
  entityType: string;
  entityId: string;
  onRestore?: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 },
};

export function VersionHistory({
  entityType,
  entityId,
  onRestore,
}: VersionHistoryProps) {
  const [versionList, setVersionList] = React.useState<Version[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState<Version | null>(null);
  const [confirmRestore, setConfirmRestore] = React.useState<Version | null>(null);
  const [open, setOpen] = React.useState(false);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const result = await versions.list(entityType, entityId);
      setVersionList(result);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      loadVersions();
    }
  }, [open, entityType, entityId]);

  const handleRestore = async (version: Version) => {
    try {
      setIsRestoring(true);
      await versions.restore(version.id);
      setConfirmRestore(null);
      setOpen(false);
      onRestore?.();
    } catch (error) {
      console.error('Failed to restore version:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="mr-2 h-4 w-4" />
            Historique
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Historique des versions</SheetTitle>
            <SheetDescription>
              Consultez et restaurez les versions précédentes
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : versionList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune version précédente</p>
              </div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="relative"
              >
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-6">
                  {versionList.map((version, index) => {
                    const userName = version.user
                      ? `${version.user.firstName} ${version.user.lastName}`
                      : 'Système';

                    return (
                      <motion.div
                        key={version.id}
                        variants={item}
                        className="relative pl-12"
                      >
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-3 w-4 h-4 rounded-full border-2 ${
                            index === 0
                              ? 'bg-primary border-primary'
                              : 'bg-background border-muted-foreground'
                          }`}
                        />

                        <div className="p-4 rounded-lg border bg-card">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(userName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{userName}</p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatDateTime(version.createdAt)}
                                </div>
                              </div>
                            </div>
                            {index === 0 && (
                              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                Actuelle
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedVersion(version)}
                            >
                              <Eye className="mr-2 h-3 w-3" />
                              Aperçu
                            </Button>
                            {index > 0 && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setConfirmRestore(version)}
                              >
                                <RotateCcw className="mr-2 h-3 w-3" />
                                Restaurer
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Preview Dialog */}
      {selectedVersion && (
        <AlertDialog
          open={!!selectedVersion}
          onOpenChange={() => setSelectedVersion(null)}
        >
          <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Aperçu de la version</AlertDialogTitle>
              <AlertDialogDescription>
                Version du {formatDateTime(selectedVersion.createdAt)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <pre className="p-4 rounded-lg bg-muted text-xs overflow-auto max-h-96">
              {JSON.stringify(selectedVersion.snapshot, null, 2)}
            </pre>
            <AlertDialogFooter>
              <AlertDialogCancel>Fermer</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Restore Confirmation */}
      <AlertDialog
        open={!!confirmRestore}
        onOpenChange={() => setConfirmRestore(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurer cette version ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le contenu actuel sera remplacé par la version du{' '}
              {confirmRestore && formatDateTime(confirmRestore.createdAt)}.
              Une nouvelle version sera créée avec l&apos;état actuel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRestore && handleRestore(confirmRestore)}
              disabled={isRestoring}
            >
              {isRestoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Restaurer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
