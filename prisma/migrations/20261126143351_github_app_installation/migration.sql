/*
  Warnings:

  - You are about to drop the column `accessToken` on the `GitHubConnection` table. All the data in the column will be lost.
  - You are about to drop the column `githubUserId` on the `GitHubConnection` table. All the data in the column will be lost.
  - You are about to drop the column `githubUsername` on the `GitHubConnection` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `GitHubConnection` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenExpiresAt` on the `GitHubConnection` table. All the data in the column will be lost.
  - You are about to drop the column `tokenExpiresAt` on the `GitHubConnection` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `GitHubConnection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountLogin` to the `GitHubConnection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountType` to the `GitHubConnection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `installationId` to the `GitHubConnection` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "GitHubConnection_githubUserId_idx";

-- AlterTable
ALTER TABLE "GitHubConnection" DROP COLUMN "accessToken",
DROP COLUMN "githubUserId",
DROP COLUMN "githubUsername",
DROP COLUMN "refreshToken",
DROP COLUMN "refreshTokenExpiresAt",
DROP COLUMN "tokenExpiresAt",
ADD COLUMN     "accountId" BIGINT NOT NULL,
ADD COLUMN     "accountLogin" TEXT NOT NULL,
ADD COLUMN     "accountType" TEXT NOT NULL,
ADD COLUMN     "installationId" BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX "GitHubConnection_installationId_idx" ON "GitHubConnection"("installationId");

-- CreateIndex
CREATE INDEX "GitHubConnection_accountId_idx" ON "GitHubConnection"("accountId");
