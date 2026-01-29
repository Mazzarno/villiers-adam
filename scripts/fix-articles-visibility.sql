-- Script de diagnostic et correction pour les actualités non visibles
-- Usage: psql $DATABASE_URL < fix-articles-visibility.sql

-- 1. Vérifier les actualités existantes
\echo '=== Articles ACTUALITE par statut ==='
SELECT
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN "publishedAt" > NOW() THEN 1 END) as future_published,
    COUNT(CASE WHEN "publishedAt" <= NOW() THEN 1 END) as past_published,
    COUNT(CASE WHEN "publishedAt" IS NULL THEN 1 END) as null_published
FROM "Article"
WHERE type = 'ACTUALITE'
GROUP BY status;

\echo ''
\echo '=== 10 dernières actualités (tous statuts) ==='
SELECT
    id,
    LEFT(title, 50) as title,
    status,
    "publishedAt",
    "createdAt",
    CASE
        WHEN status = 'PUBLISHED' AND "publishedAt" <= NOW() THEN 'VISIBLE'
        WHEN status = 'PUBLISHED' AND "publishedAt" > NOW() THEN 'SCHEDULED'
        WHEN status = 'DRAFT' THEN 'DRAFT'
        WHEN status = 'ARCHIVED' THEN 'ARCHIVED'
        ELSE 'OTHER'
    END as visibility
FROM "Article"
WHERE type = 'ACTUALITE'
ORDER BY "createdAt" DESC
LIMIT 10;

\echo ''
\echo '=== Actualités qui devraient être visibles mais ne le sont pas ==='
SELECT
    id,
    LEFT(title, 50) as title,
    status,
    "publishedAt",
    "createdAt"
FROM "Article"
WHERE type = 'ACTUALITE'
  AND status = 'DRAFT'
  AND "createdAt" < NOW() - INTERVAL '1 day'
ORDER BY "createdAt" DESC;

-- Décommenter les lignes suivantes pour corriger automatiquement
-- ATTENTION: Vérifier d'abord les résultats ci-dessus !

-- \echo ''
-- \echo '=== CORRECTION: Publier les actualités en brouillon de plus de 1 jour ==='
-- UPDATE "Article"
-- SET
--     status = 'PUBLISHED',
--     "publishedAt" = "createdAt",
--     "updatedAt" = NOW()
-- WHERE type = 'ACTUALITE'
--   AND status = 'DRAFT'
--   AND "createdAt" < NOW() - INTERVAL '1 day'
-- RETURNING id, title, status, "publishedAt";

\echo ''
\echo '=== Résumé final ==='
SELECT
    COUNT(*) as total_actualites,
    COUNT(CASE WHEN status = 'PUBLISHED' AND "publishedAt" <= NOW() THEN 1 END) as visibles,
    COUNT(CASE WHEN status = 'PUBLISHED' AND "publishedAt" > NOW() THEN 1 END) as programmees,
    COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) as brouillons
FROM "Article"
WHERE type = 'ACTUALITE';
