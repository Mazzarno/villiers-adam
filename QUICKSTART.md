# Quick Start - Refonte CMS Villiers-Adam

## ✅ Déjà fait (par Claude Code)

- ✅ **5 bugs corrigés** : Actualités, médias, preview, dyslexie, sync paramètres
- ✅ **Schema Prisma nettoyé** : Suppression de 6 modèles et 4 enums inutilisés
- ✅ **Scripts de backup** : PostgreSQL, export JSON, audit
- ✅ **Documentation complète** : Migration, changements, procédures

## 🚀 À faire maintenant (5 étapes)

### 1. Générer migration Prisma (5 min)

```bash
cd villiers-adam/apps/api
pnpm prisma migrate dev --name remove_unused_modules
pnpm prisma generate
```

### 2. Supprimer modules API (2 min)

```bash
cd villiers-adam/apps/api/src/modules
rm -rf agenda/ reservations/ rooms/ forms/ content/pages/
```

Puis éditer `app.module.ts` pour supprimer les imports de ces modules.

### 3. Supprimer UI Admin (2 min)

```bash
cd villiers-adam/apps/admin/src/app/\(dashboard\)
rm -rf content/pages/ agenda/ reservations/ salles/ forms/
```

Puis éditer `sidebar.tsx` pour supprimer les liens navigation.

### 4. Supprimer UI Web (1 min)

```bash
cd villiers-adam/apps/web/src/app
rm -rf \[...slug\]/ agenda/ reservations/
```

### 5. Tester (5 min)

```bash
cd villiers-adam
pnpm build
pnpm typecheck
pnpm lint
```

## 📋 Checklist complète

- [ ] Migration Prisma appliquée
- [ ] Modules API supprimés
- [ ] UI Admin nettoyée
- [ ] UI Web nettoyée
- [ ] Build réussi
- [ ] TypeCheck OK
- [ ] Lint OK
- [ ] API démarre sans erreur
- [ ] Admin accessible et fonctionnel
- [ ] Web affiche les actualités
- [ ] Médias visibles
- [ ] Mode dyslexique fonctionne

## 📚 Docs détaillées

- **Guide complet** : `README_IMPLEMENTATION.md`
- **Résumé détaillé** : `docs/IMPLEMENTATION_SUMMARY.md`
- **Changements Phase 1** : `docs/CHANGEMENTS_PHASE1.md`
- **Migration** : `docs/migration.md`

## 🆘 Rollback

```bash
# Restaurer schema
cp apps/api/prisma/schema.prisma.backup apps/api/prisma/schema.prisma

# Restaurer DB
gunzip data/archives/db_backup_*.sql.gz
psql $DATABASE_URL < data/archives/db_backup_*.sql
```

---

**Temps estimé total : ~15 minutes** 🚀
