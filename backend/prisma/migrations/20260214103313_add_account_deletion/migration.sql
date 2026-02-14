-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING_DELETION', 'DELETED');

-- CreateEnum
CREATE TYPE "DeletionRequestStatus" AS ENUM ('PENDING', 'VERIFIED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeleteReason" AS ENUM ('NOT_USING_ANYMORE', 'PRIVACY_CONCERN', 'FOUND_ALTERNATIVE', 'BAD_EXPERIENCE', 'TOO_MANY_NOTIFICATIONS', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleteReason" "DeleteReason",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledDeleteAt" TIMESTAMP(3),
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "DeletionRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" "DeleteReason",
    "otherReason" TEXT,
    "otpCode" TEXT,
    "otpRef" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "otpAttempts" INTEGER NOT NULL DEFAULT 0,
    "status" "DeletionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "DeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeletionRequest_userId_idx" ON "DeletionRequest"("userId");

-- CreateIndex
CREATE INDEX "DeletionRequest_status_idx" ON "DeletionRequest"("status");

-- CreateIndex
CREATE INDEX "DeletionRequest_requestedAt_idx" ON "DeletionRequest"("requestedAt");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_scheduledDeleteAt_idx" ON "User"("scheduledDeleteAt");

-- AddForeignKey
ALTER TABLE "DeletionRequest" ADD CONSTRAINT "DeletionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
