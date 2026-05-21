'use client';

import * as React from 'react';
import { Download, Upload, FileJson, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { authenticatedFetch } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ExportImportPage() {
  const [isExporting, setIsExporting] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState(0);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      const response = await authenticatedFetch(`${API_URL}/export`);

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `villiers-adam-export-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: 'Export réussi ! Le fichier a été téléchargé.' });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'export. Veuillez réessayer.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);
    setMessage(null);

    try {
      // Simuler la progression
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      const response = await authenticatedFetch(`${API_URL}/export/import`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Import failed');
      }

      setMessage({ type: 'success', text: 'Import réussi ! Les données ont été importées.' });
    } catch (error) {
      console.error('Import error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de l\'import.',
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Export / Import</h1>
        <p className="text-muted-foreground">
          Exportez ou importez les données du site au format JSON
        </p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{message.type === 'success' ? 'Succès' : 'Erreur'}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export
            </CardTitle>
            <CardDescription>
              Téléchargez une sauvegarde complète des données du site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              L&apos;export inclut :
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Actualités et événements</li>
              <li>Annuaire (associations, commerces, entreprises)</li>
              <li>Démarches administratives</li>
              <li>Conseil municipal</li>
              <li>Services municipaux</li>
              <li>Transports</li>
              <li>Médias (métadonnées et fichiers)</li>
              <li>Paramètres du site</li>
            </ul>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter les données
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import
            </CardTitle>
            <CardDescription>
              Restaurez les données à partir d&apos;un fichier d&apos;export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription>
                L&apos;import est non destructif par défaut : il ajoute uniquement les
                enregistrements absents. Le remplacement total est un mode sécurisé
                séparé côté API.
              </AlertDescription>
            </Alert>

            {isImporting && (
              <div className="space-y-2">
                <Progress value={importProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  Import en cours... {importProgress}%
                </p>
              </div>
            )}

            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="import-file"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  isImporting ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileJson className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Cliquez pour sélectionner</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fichier ZIP d&apos;export (.zip)
                  </p>
                </div>
                <input
                  id="import-file"
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleImport}
                  disabled={isImporting}
                />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schema JSON */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Format des données
          </CardTitle>
          <CardDescription>
            Structure JSON attendue pour l&apos;import
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-xs">
{`{
  "version": "1.0",
  "exportedAt": "2024-01-29T10:00:00Z",
  "data": {
    "articles": [...],
    "events": [...],
    "directoryEntries": [...],
    "procedures": [...],
    "councilMembers": [...],
    "municipalServices": [...],
    "transportInfo": [...],
    "media": [...],
    "settings": {...}
  }
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
