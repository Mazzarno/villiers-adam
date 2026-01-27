-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('ACTUALITE', 'PUBLICATION', 'BREVE');

-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('ARRETE', 'COMPTE_RENDU', 'DELIBERATION');

-- CreateEnum
CREATE TYPE "CouncilMemberRole" AS ENUM ('MAIRE', 'ADJOINT', 'CONSEILLER', 'CONSEILLER_DELEGUE');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "documentMediaId" TEXT,
ADD COLUMN     "documentNumber" TEXT,
ADD COLUMN     "meetingDate" TIMESTAMP(3),
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "publicationType" "PublicationType",
ADD COLUMN     "publicationYear" INTEGER,
ADD COLUMN     "type" "ArticleType" NOT NULL DEFAULT 'ACTUALITE';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "blocks" JSONB,
ADD COLUMN     "menuOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "menuTitle" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "showInMenu" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "template" TEXT;

-- CreateTable
CREATE TABLE "CouncilMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "CouncilMemberRole" NOT NULL,
    "roleTitle" TEXT,
    "delegations" TEXT,
    "bio" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "photoMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "CouncilMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MunicipalService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "openingHours" JSONB,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "coverMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "MunicipalService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportInfo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB NOT NULL,
    "operator" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "coverMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "TransportInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CouncilMember_role_idx" ON "CouncilMember"("role");

-- CreateIndex
CREATE INDEX "CouncilMember_status_publishedAt_idx" ON "CouncilMember"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "CouncilMember_scheduledAt_idx" ON "CouncilMember"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "MunicipalService_slug_key" ON "MunicipalService"("slug");

-- CreateIndex
CREATE INDEX "MunicipalService_status_publishedAt_idx" ON "MunicipalService"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "MunicipalService_scheduledAt_idx" ON "MunicipalService"("scheduledAt");

-- CreateIndex
CREATE INDEX "MunicipalService_category_idx" ON "MunicipalService"("category");

-- CreateIndex
CREATE UNIQUE INDEX "TransportInfo_slug_key" ON "TransportInfo"("slug");

-- CreateIndex
CREATE INDEX "TransportInfo_status_publishedAt_idx" ON "TransportInfo"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "TransportInfo_scheduledAt_idx" ON "TransportInfo"("scheduledAt");

-- CreateIndex
CREATE INDEX "Page_parentId_idx" ON "Page"("parentId");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_documentMediaId_fkey" FOREIGN KEY ("documentMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilMember" ADD CONSTRAINT "CouncilMember_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilMember" ADD CONSTRAINT "CouncilMember_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilMember" ADD CONSTRAINT "CouncilMember_photoMediaId_fkey" FOREIGN KEY ("photoMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MunicipalService" ADD CONSTRAINT "MunicipalService_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MunicipalService" ADD CONSTRAINT "MunicipalService_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MunicipalService" ADD CONSTRAINT "MunicipalService_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportInfo" ADD CONSTRAINT "TransportInfo_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportInfo" ADD CONSTRAINT "TransportInfo_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportInfo" ADD CONSTRAINT "TransportInfo_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
