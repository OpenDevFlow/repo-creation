-- CreateTable
CREATE TABLE "RepoRequest" (
    "id" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visibility" TEXT NOT NULL,
    "teamSlug" TEXT,
    "justification" TEXT NOT NULL,
    "requesterLogin" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requesterName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "repoUrl" TEXT,
    "rejectionReason" TEXT,
    "adminComment" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepoRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RepoRequest_status_idx" ON "RepoRequest"("status");

-- CreateIndex
CREATE INDEX "RepoRequest_requesterLogin_idx" ON "RepoRequest"("requesterLogin");
