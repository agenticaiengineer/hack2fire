CREATE TYPE "Role" AS ENUM ('END_USER', 'CONTRIBUTOR', 'ADMIN');
CREATE TYPE "QuestionType" AS ENUM ('CODING', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'VIDEO', 'MIXED');
CREATE TYPE "QuestionStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'END_USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuestionTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" "QuestionType" NOT NULL DEFAULT 'CODING',
  "scaffold" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuestionTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Question" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "company" TEXT,
  "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
  "type" "QuestionType" NOT NULL DEFAULT 'CODING',
  "status" "QuestionStatus" NOT NULL DEFAULT 'REVIEW',
  "tags" TEXT[],
  "promptMd" TEXT NOT NULL,
  "solutionMd" TEXT,
  "videoUrl" TEXT,
  "starterCode" TEXT,
  "testCases" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "authorId" TEXT NOT NULL,
  "templateId" TEXT,
  CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Attempt" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Question_slug_key" ON "Question"("slug");

ALTER TABLE "Question" ADD CONSTRAINT "Question_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "QuestionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
