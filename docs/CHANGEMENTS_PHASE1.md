# Phase 1 : Nettoyage du scope - Changements effectués

**Date :** 29 janvier 2024
**Objectif :** Supprimer les modules inutilisés du CMS Villiers-Adam

## Modifications du Schema Prisma

### Enums supprimés

- `AgendaType` (COMMUNAL, ASSOCIATIF, DECHETS)
- `ReservationStatus` (PENDING, APPROVED, REJECTED, CANCELLED)
- `FormType` (CONTACT, SIGNALEMENT)
- `FormStatus` (NEW, IN_PROGRESS, CLOSED)

### Modèles supprimés

1. **Page** - Système de pages CMS
2. **PageMedia** - Table de jointure Page-Media
3. **AgendaItem** - Événements au format agenda
4. **Room** - Salles à réserver
5. **Reservation** - Réservations de salles
6. **FormSubmission** - Soumissions de formulaires

### Relations User supprimées

Dans le modèle `User`, suppression des relations :
- `createdPages` / `updatedPages` (vers Page)
- `createdAgendaItems` / `updatedAgendaItems` (vers AgendaItem)
- `reservationsHandled` (vers Reservation)

### Relations Media supprimées

Dans le modèle `Media`, suppression des relations :
- `pageCovers` (vers Page)
- `pageMedia` (vers PageMedia)

## Fichiers créés

### Scripts de backup et migration

- `/scripts/backup/backup-database.sh` - Backup PostgreSQL automatisé
- `/scripts/backup/audit-data.sh` - Audit des données avant migration
- `/scripts/backup/export-data.js` - Export JSON des données
- `/scripts/backup/README.md` - Documentation des scripts
- `/scripts/migration-remove-modules.sql` - Migration SQL manuelle
- `/scripts/fix-articles-visibility.sql` - Script de diagnostic pour Bug 1

### Documentation

- `/docs/migration.md` - Procédure complète de migration
- `/docs/CHANGEMENTS_PHASE1.md` - Ce document

## Modules conservés

Les modules suivants restent actifs :

- **Article** - Actualités, publications, brèves
- **Event** - Événements
- **DirectoryEntry** - Annuaire (associations, entreprises, commerces)
- **Procedure** - Démarches administratives
- **CouncilMember** - Membres du conseil municipal
- **MunicipalService** - Services municipaux
- **TransportInfo** - Informations de transport
- **Media** - Gestion des médias
- **User** - Utilisateurs et permissions
- **Settings** - Paramètres du site
- **AuditLog** / **Version** - Historique et versioning
- **NewsletterSubscription** - Inscriptions newsletter

## Prochaines étapes

1. **Vérifier le schema Prisma** : `cd apps/api && pnpm prisma format`
2. **Créer la migration** : `pnpm prisma migrate dev --name remove_unused_modules`
3. **Supprimer les modules API** (voir phase suivante)
4. **Supprimer les UI admin et web** (voir phase suivante)
5. **Tester le build complet**

## Rollback

En cas de problème, le fichier backup existe :
- `/apps/api/prisma/schema.prisma.backup`

Pour restaurer la base de données :
```bash
gunzip data/archives/db_backup_TIMESTAMP.sql.gz
psql $DATABASE_URL < data/archives/db_backup_TIMESTAMP.sql
```

## Notes importantes

⚠️ **IMPORTANT** : Avant d'exécuter la migration Prisma, s'assurer que :
1. Un backup complet de la DB est fait
2. L'export JSON des données est généré
3. L'audit des données a été exécuté
4. Les modules API/UI ne sont pas encore supprimés (ils le seront après la migration DB)

## Validation

- [x] Schema Prisma nettoyé
- [x] Scripts de backup créés
- [x] Documentation créée
- [ ] Migration Prisma générée et testée
- [ ] Modules API supprimés
- [ ] UI admin supprimée
- [ ] UI web supprimée
- [ ] Build complet réussi
