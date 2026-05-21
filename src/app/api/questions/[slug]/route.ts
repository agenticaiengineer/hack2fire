import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Difficulty, QuestionStatus, QuestionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/api-auth";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  promptMd: z.string().min(1).optional(),
  company: z.string().nullable().optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  type: z.nativeEnum(QuestionType).optional(),
  status: z.nativeEnum(QuestionStatus).optional(),
  tags: z.array(z.string()).optional(),
  solutionMd: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  starterCode: z.string().nullable().optional(),
  testCases: z.any().optional(),
  categoryId: z.string().nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const denied = requireApiKey(req);
  if (denied) return denied;

  const { slug } = await params;
  const question = await prisma.question.findUnique({
    where: { slug },
    include: { category: true, versions: { orderBy: { version: "desc" } } },
  });

  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(question);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const denied = requireApiKey(req);
  if (denied) return denied;

  const { slug } = await params;
  const existing = await prisma.question.findUnique({ where: { slug } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const nextVersion = existing.currentVersion + 1;
  const merged = {
    title: parsed.data.title ?? existing.title,
    summary: parsed.data.summary ?? existing.summary,
    company: parsed.data.company !== undefined ? parsed.data.company : existing.company,
    difficulty: parsed.data.difficulty ?? existing.difficulty,
    type: parsed.data.type ?? existing.type,
    tags: parsed.data.tags ?? existing.tags,
    promptMd: parsed.data.promptMd ?? existing.promptMd,
    solutionMd: parsed.data.solutionMd !== undefined ? parsed.data.solutionMd : existing.solutionMd,
    videoUrl: parsed.data.videoUrl !== undefined ? parsed.data.videoUrl : existing.videoUrl,
    starterCode: parsed.data.starterCode !== undefined ? parsed.data.starterCode : existing.starterCode,
  };

  const question = await prisma.$transaction(async (tx) => {
    await tx.questionVersion.create({
      data: {
        questionId: existing.id,
        version: nextVersion,
        status: parsed.data.status ?? existing.status,
        ...merged,
        changeNote: "Updated via API",
        createdById: existing.authorId,
      },
    });

    return tx.question.update({
      where: { slug },
      data: {
        ...parsed.data,
        currentVersion: nextVersion,
      },
    });
  });

  return NextResponse.json(question);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const denied = requireApiKey(req);
  if (denied) return denied;

  const { slug } = await params;
  const existing = await prisma.question.findUnique({ where: { slug } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const question = await prisma.question.update({
    where: { slug },
    data: { status: QuestionStatus.ARCHIVED },
  });

  return NextResponse.json(question);
}
