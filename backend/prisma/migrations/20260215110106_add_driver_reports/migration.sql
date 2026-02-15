-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('DRIVING_BEHAVIOR', 'VEHICLE_CONDITION', 'SERVICE_QUALITY', 'SAFETY_CONCERN', 'PAYMENT_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('SPEEDING', 'RECKLESS_DRIVING', 'PHONE_WHILE_DRIVING', 'DIRTY_VEHICLE', 'VEHICLE_MALFUNCTION', 'BAD_SMELL', 'RUDE_BEHAVIOR', 'UNPROFESSIONAL', 'LATE_ARRIVAL', 'WRONG_ROUTE', 'UNSAFE_FEELING', 'HARASSMENT', 'INTOXICATED', 'OVERCHARGING', 'REFUSED_PAYMENT_METHOD', 'NO_SHOW', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "DriverReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "bookingId" TEXT,
    "category" "ReportCategory" NOT NULL,
    "type" "ReportType" NOT NULL,
    "severity" "ReportSeverity" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "attachments" JSON,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "resolution" TEXT,
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "DriverReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverReport_reporterId_idx" ON "DriverReport"("reporterId");

-- CreateIndex
CREATE INDEX "DriverReport_driverId_idx" ON "DriverReport"("driverId");

-- CreateIndex
CREATE INDEX "DriverReport_bookingId_idx" ON "DriverReport"("bookingId");

-- CreateIndex
CREATE INDEX "DriverReport_status_idx" ON "DriverReport"("status");

-- CreateIndex
CREATE INDEX "DriverReport_category_idx" ON "DriverReport"("category");

-- CreateIndex
CREATE INDEX "DriverReport_severity_idx" ON "DriverReport"("severity");

-- CreateIndex
CREATE INDEX "DriverReport_createdAt_idx" ON "DriverReport"("createdAt");

-- AddForeignKey
ALTER TABLE "DriverReport" ADD CONSTRAINT "DriverReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverReport" ADD CONSTRAINT "DriverReport_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverReport" ADD CONSTRAINT "DriverReport_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
