import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Difficulty, QuestionStatus, QuestionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/api-auth";
import { slugify } from "@/lib/format";

const createSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  promptMd: z.string().min(1),
  company: z.string().optional(),
  difficulty: z.nativeEnum(Difficulty).default(Difficulty.MEDIUM),
  type: z.nativeEnum(QuestionType).default(QuestionType.CODING),
  tags: z.array(z.string()).default([]),
  solutionMd: z.string().optional(),
  videoUrl: z.string().optional(),
  starterCode: z.string().optional(),
  testCases: z.any().optional(),
  templateId: z.string().optional(),
  categoryId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const denied = requireApiKey(req);
  if (denied) return denied;

  const url = req.nextUrl;
  const where: Record<string, unknown> = {};
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  const difficulty = url.searchParams.get("difficulty");
  if (status) where.status = status;
  if (type) where.type = type;
  if (difficulty) where.difficulty = difficulty;

  const questions = await prisma.question.findMany({
    where,
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const denied = requireApiKey(req);
  if (denied) return denied;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const slug = `${slugify(data.title)}-${Date.now().toString(36)}`;

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    return NextResponse.json({ error: "No admin user exists to assign as author" }, { status: 500 });
  }

  const question = await prisma.question.create({
    data: {
      title: data.title,
      slug,
      summary: data.summary,
      company: data.company ?? null,
      difficulty: data.difficulty,
      type: data.type,
      status: QuestionStatus.PUBLISHED,
      tags: data.tags,
      promptMd: data.promptMd,
      solutionMd: data.solutionMd ?? null,
      videoUrl: data.videoUrl ?? null,
      starterCode: data.starterCode ?? null,
      testCases: data.testCases ?? null,
      templateId: data.templateId ?? null,
      categoryId: data.categoryId ?? null,
      authorId: admin.id,
      versions: {
        create: {
          version: 1,
          status: QuestionStatus.PUBLISHED,
          title: data.title,
          summary: data.summary,
          company: data.company ?? null,
          difficulty: data.difficulty,
          type: data.type,
          tags: data.tags,
          promptMd: data.promptMd,
          solutionMd: data.solutionMd ?? null,
          videoUrl: data.videoUrl ?? null,
          starterCode: data.starterCode ?? null,
          changeNote: "Initial version (API)",
          createdById: admin.id,
        },
      },
    },
  });

  return NextResponse.json(question, { status: 201 });
}
