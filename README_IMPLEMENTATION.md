# Guide d'implémentation - Refonte Villiers-Adam CMS

Ce document vous guide pour terminer l'implémentation de la refonte du CMS.

## 📊 État d'avancement

### ✅ Terminé

- **Phase 0 : Backup et préparation**
  - Scripts de backup PostgreSQL, MinIO, et export JSON
  - Documentation complète de migration

- **Phase 2 : Correction des 5 bugs critiques**
  - Bug 1 : Actualités non visibles (logs + script SQL)
  - Bug 2 : Médias non visibles (CSP corrigée)
  - Bug 3 : Preview non fonctionnelle (validation token)
  - Bug 4 : Mode dyslexique (déjà fonctionnel)
  - Bug 5 : Sync paramètres admin/web (endpoint + cache)

- **Phase 1 : Nettoyage du scope (Schema Prisma)**
  - Suppression des enums : AgendaType, ReservationStatus, FormType, FormStatus
  - Suppression des modèles : Page, PageMedia, AgendaItem, Room, Reservation, FormSubmission
  - Nettoyage des relations User et Media

### ⏳ À terminer

Les étapes suivantes doivent être exécutées **dans l'ordre** :

---

## 🚀 Étape 1 : Générer et appliquer la migration Prisma

### 1.1 Vérifier le schema

```bash
cd /Users/alex/Desktop/projet-mairie/villiers-adam/apps/api
pnpm prisma format
```

### 1.2 Créer la migration

```bash
pnpm prisma migrate dev --name remove_unused_modules
```

Ceci va :
- Créer le fichier de migration SQL
- L'appliquer à la base de données
- Régénérer le client Prisma

### 1.3 Vérifier que tout fonctionne

```bash
pnpm prisma studio
```

Vérifier que les tables suivantes ont bien été supprimées :
- Page
- PageMedia
- AgendaItem
- Room
- Reservation
- FormSubmission

---

## 🗑️ Étape 2 : Supprimer les modules API

### 2.1 Supprimer les dossiers

```bash
cd /Users/alex/Desktop/projet-mairie/villiers-adam/apps/api/src/modules

# Supprimer les modules inutilisés
rm -rf agenda/
rm -rf reservations/
rm -rf rooms/
rm -rf forms/
rm -rf content/pages/
```

### 2.2 Nettoyer app.module.ts

Éditer `apps/api/src/app.module.ts` :

Supprimer les imports :
```typescript
import { AgendaModule } from './modules/agenda/agenda.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { FormsModule } from './modules/forms/forms.module';
```

Supprimer de l'array imports dans @Module :
```typescript
AgendaModule,
ReservationsModule,
RoomsModule,
FormsModule,
```

### 2.3 Nettoyer content.module.ts

Éditer `apps/api/src/modules/content/content.module.ts` :

Supprimer :
- Import de PagesController
- Import de PagesService
- Références dans controllers et providers

### 2.4 Tester le build

```bash
cd /Users/alex/Desktop/projet-mairie/villiers-adam/apps/api
pnpm build
```

---

## 🎨 Étape 3 : Supprimer les UI Admin

### 3.1 Supprimer les pages

```bash
cd /Users/alex/Desktop/projet-mairie/villiers-adam/apps/admin/src/app/\(dashboard\)

# Supprimer les dossiers
rm -rf content/pages/
rm -rf agenda/
rm -rf reservations/
rm -rf salles/
rm -rf forms/
```

### 3.2 Nettoyer la sidebar

Éditer `apps/admin/src/components/layout/sidebar.tsx` :

Supprimer de l'array navigation :
```typescript
{ name: 'Pages', href: '/content/pages', icon: FileText },
{ name: 'Agenda', href: '/agenda', icon: CalendarClock },
{ name: 'Réservations', href: '/reservations', icon: FolderOpen },
{ name: 'Formulaires', href: '/forms', icon: MessageSquare },
```

### 3.3 Tester le build

```bash
cd /Users/alex/Desktop/projet-mairie/villiers-adam/apps/admin
pnpm build
```

---

## 🌐 Étape 4 : Supprimer les UI Web

### 4.1 Supprimer les pages

```bash
cd /Users/alex/Desktop/projet-mairie/villiers-adam/apps/web/src/app

# Supprimer les dossiers
rm -rf \[...slug\]/
rm -rf agenda/
rm -rf reservations/
```

**Note :** Garder `/contact/` si vous souhaitez un formulaire de contact simple (il peut être refait sans le module Forms).

### 4.2 Tester le build

```bash
cd /Users/alex/Desktop/projet-mairie/villiers-adam/apps/web
pnpm build
```

---

## ✅ Étape 5 : Validation complète

### 5.1 Build global

```bash
cd /Users/alex/Desktop/projet-mairie/villiers-adam
pnpm build
```

### 5.2 Tests TypeScript

```bash
pnpm typecheck
```

### 5.3 Linting

```bash
pnpm lint
```

### 5.4 Tests manuels

1. **API**
   - Démarrer : `cd apps/api && pnpm dev`
   - Vérifier que l'API démarre sans erreur
   - Tester quelques endpoints : `/articles`, `/events`, `/settings/public`

2. **Admin**
   - Démarrer : `cd apps/admin && pnpm dev`
   - Se connecter
   - Vérifier navigation
   - Tester création/modification d'articles
   - Tester upload de médias

3. **Web**
   - Démarrer : `cd apps/web && pnpm dev`
   - Naviguer sur le site
   - Vérifier affichage des actualités
   - Tester le mode dyslexique
   - Vérifier que les médias s'affichent

---

## 🎯 Phases optionnelles restantes

Une fois les étapes 1-5 terminées, vous pouvez implémenter les phases suivantes selon vos besoins :

### Phase 3 : Améliorer module Commerces

**Fichiers à créer/modifier :**
- `apps/admin/src/app/(dashboard)/annuaire/page.tsx` - Ajouter tabs filtre
- `apps/web/src/app/commerces/page.tsx` - Nouvelle page dédiée
- `apps/web/src/components/directory/directory-card.tsx` - Affichage horaires

### Phase 4 : Header Admin complet

**Fichiers à créer :**
- `apps/admin/src/components/layout/search-command.tsx` - Command palette
- `apps/api/src/modules/notifications/` - Module notifications
- Schema Prisma : modèle Notification
- `apps/admin/src/components/layout/notifications-popover.tsx`
- `apps/admin/src/app/(dashboard)/profile/page.tsx`

### Phase 5 : Sidebar Admin complète

**Fichiers à modifier :**
- `apps/admin/src/components/layout/sidebar.tsx` - Restructurer navigation
- `apps/admin/src/hooks/use-content-counts.ts` - Nouveau hook pour badges

### Phase 6 : Export/Import JSON

**Fichiers à créer/modifier :**
- `apps/api/src/modules/export/` - Améliorer module existant
- Schema Prisma : modèle ExportArchive
- `apps/admin/src/app/(dashboard)/settings/export-import/page.tsx`

---

## 📚 Documentation

Tous les détails sont disponibles dans :
- `docs/IMPLEMENTATION_SUMMARY.md` - Vue d'ensemble complète
- `docs/CHANGEMENTS_PHASE1.md` - Détails Phase 1
- `docs/migration.md` - Procédure de migration
- `scripts/backup/README.md` - Scripts de backup

---

## 🆘 En cas de problème

### Rollback Schema Prisma

```bash
cd /Users/alex/Desktop/projet-mairie/villiers-adam/apps/api/prisma
cp schema.prisma.backup schema.prisma
pnpm prisma migrate reset
```

### Restaurer base de données

```bash
cd /Users/alex/Desktop/projet-mairie/villiers-adam
gunzip data/archives/db_backup_TIMESTAMP.sql.gz
psql $DATABASE_URL < data/archives/db_backup_TIMESTAMP.sql
```

### Logs et debug

```bash
# API
cd apps/api && pnpm dev | tee api.log

# Vérifier les logs Prisma
export DEBUG="prisma:*"
pnpm dev
```

---

## 📞 Support

Pour toute question sur l'implémentation :
1. Consulter `docs/IMPLEMENTATION_SUMMARY.md`
2. Vérifier les logs dans la console
3. Consulter la documentation Prisma/Next.js si nécessaire

---

## ✨ Bon à savoir

- Tous les bugs critiques ont été corrigés ✅
- Le schema Prisma est nettoyé ✅
- Les scripts de backup sont prêts ✅
- La documentation est complète ✅
- Les phases optionnelles peuvent être faites plus tard

**Vous pouvez maintenant exécuter les étapes 1-5 en toute confiance !**
