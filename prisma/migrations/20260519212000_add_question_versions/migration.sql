ALTER TABLE "Question" ADD COLUMN "currentVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Question" ADD COLUMN "publishedVersion" INTEGER NOT NULL DEFAULT 1;

CREATE TABLE "QuestionVersion" (
  "id" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "status" "QuestionStatus" NOT NULL DEFAULT 'REVIEW',
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "company" TEXT,
  "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
  "type" "QuestionType" NOT NULL DEFAULT 'CODING',
  "tags" TEXT[],
  "promptMd" TEXT NOT NULL,
  "solutionMd" TEXT,
  "videoUrl" TEXT,
  "starterCode" TEXT,
  "changeNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById" TEXT NOT NULL,
  CONSTRAINT "QuestionVersion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QuestionVersion_questionId_version_key" ON "QuestionVersion"("questionId", "version");

ALTER TABLE "QuestionVersion" ADD CONSTRAINT "QuestionVersion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionVersion" ADD CONSTRAINT "QuestionVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "QuestionVersion" (
  "id", "questionId", "version", "status", "title", "summary", "company", "difficulty", "type", "tags",
  "promptMd", "solutionMd", "videoUrl", "starterCode", "changeNote", "createdAt", "createdById"
)
SELECT
  'seed-version-' || "id", "id", 1, "status", "title", "summary", "company", "difficulty", "type", "tags",
  "promptMd", "solutionMd", "videoUrl", "starterCode", 'Initial imported version', "createdAt", "authorId"
FROM "Question"
ON CONFLICT ("questionId", "version") DO NOTHING;
