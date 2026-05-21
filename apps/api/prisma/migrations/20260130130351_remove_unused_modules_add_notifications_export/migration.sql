-- Drop unused CMS/agenda/reservations/forms tables
DROP TABLE IF EXISTS "PageMedia" CASCADE;
DROP TABLE IF EXISTS "AgendaItem" CASCADE;
DROP TABLE IF EXISTS "Reservation" CASCADE;
DROP TABLE IF EXISTS "Room" CASCADE;
DROP TABLE IF EXISTS "FormSubmission" CASCADE;
DROP TABLE IF EXISTS "Page" CASCADE;

-- Drop unused enums
DROP TYPE IF EXISTS "AgendaType";
DROP TYPE IF EXISTS "ReservationStatus";
DROP TYPE IF EXISTS "FormType";
DROP TYPE IF EXISTS "FormStatus";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportArchive" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'zip',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExportArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExportArchive_storageKey_key" ON "ExportArchive"("storageKey");

-- CreateIndex
CREATE INDEX "ExportArchive_createdById_idx" ON "ExportArchive"("createdById");

-- CreateIndex
CREATE INDEX "ExportArchive_createdAt_idx" ON "ExportArchive"("createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportArchive" ADD CONSTRAINT "ExportArchive_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
