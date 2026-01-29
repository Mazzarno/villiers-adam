-- Migration manuelle: Suppression des modules inutilisés
-- Date: 2024-01-29
-- Description: Supprime Pages CMS, Agenda, Réservations, Formulaires

-- IMPORTANT: Exécuter cette migration manuellement APRÈS avoir fait un backup
-- Usage: psql $DATABASE_URL < migration-remove-modules.sql

BEGIN;

-- 1. Supprimer les tables de jointure en premier (pas de FK vers elles)
DROP TABLE IF EXISTS "PageMedia" CASCADE;

-- 2. Supprimer les tables avec FK vers User uniquement
DROP TABLE IF EXISTS "AgendaItem" CASCADE;
DROP TABLE IF EXISTS "Room" CASCADE;
DROP TABLE IF EXISTS "Reservation" CASCADE;
DROP TABLE IF EXISTS "FormSubmission" CASCADE;

-- 3. Supprimer la table Page (a des FK complexes avec Media)
DROP TABLE IF EXISTS "Page" CASCADE;

-- 4. Supprimer les enums inutilisés
DROP TYPE IF EXISTS "AgendaType" CASCADE;
DROP TYPE IF EXISTS "ReservationStatus" CASCADE;
DROP TYPE IF EXISTS "FormType" CASCADE;
DROP TYPE IF EXISTS "FormStatus" CASCADE;

COMMIT;

-- Vérification
\echo '=== Tables restantes ==='
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

\echo ''
\echo '=== Enums restants ==='
SELECT t.typname as enum_name
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY t.typname
ORDER BY t.typname;
