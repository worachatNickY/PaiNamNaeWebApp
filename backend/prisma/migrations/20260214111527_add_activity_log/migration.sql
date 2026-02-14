-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('LOGIN', 'LOGOUT', 'REGISTER', 'PASSWORD_CHANGE', 'PROFILE_UPDATE', 'BOOKING_CREATE', 'BOOKING_CANCEL', 'ROUTE_CREATE', 'ROUTE_CANCEL', 'PAYMENT', 'ACCOUNT_DELETE_REQUEST', 'ACCOUNT_DELETE_CONFIRM', 'ACCOUNT_DELETE_CANCEL', 'DRIVER_VERIFICATION', 'EMERGENCY_REQUEST', 'REPORT_SUBMIT');

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "activityType" "ActivityType" NOT NULL,
    "description" TEXT,
    "metadata" JSON,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledLogDeleteAt" TIMESTAMP(3),

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_userEmail_idx" ON "ActivityLog"("userEmail");

-- CreateIndex
CREATE INDEX "ActivityLog_activityType_idx" ON "ActivityLog"("activityType");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_scheduledLogDeleteAt_idx" ON "ActivityLog"("scheduledLogDeleteAt");
