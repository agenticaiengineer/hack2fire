"use server";

import bcrypt from "bcryptjs";
import { Difficulty, QuestionStatus, QuestionType, Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authenticate, createSession, destroySession, requireRole, requireUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const user = await authenticate(email, password);
  if (!user) redirect("/login?error=invalid");
  await createSession(user);
  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) redirect("/login?error=register");

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase().trim(),
      role: Role.END_USER,
      passwordHash: await bcrypt.hash(parsed.data.password, 12)
    }
  });

  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function createQuestionAction(formData: FormData) {
  const user = await requireRole([Role.CONTRIBUTOR, Role.ADMIN]);
  const title = String(formData.get("title") ?? "Untitled question");
  const slug = slugify(title);
  const status = user.role === Role.ADMIN ? QuestionStatus.PUBLISHED : QuestionStatus.REVIEW;
  const data = {
    title,
    summary: String(formData.get("summary") ?? ""),
    company: String(formData.get("company") ?? "") || null,
    difficulty: String(formData.get("difficulty") ?? Difficulty.MEDIUM) as Difficulty,
    type: String(formData.get("type") ?? QuestionType.CODING) as QuestionType,
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    promptMd: String(formData.get("promptMd") ?? ""),
    solutionMd: String(formData.get("solutionMd") ?? "") || null,
    videoUrl: String(formData.get("videoUrl") ?? "") || null,
    starterCode: String(formData.get("starterCode") ?? "") || null
  };

  await prisma.question.create({
    data: {
      ...data,
      slug: `${slug}-${Date.now().toString(36)}`,
      status,
      authorId: user.id,
      templateId: String(formData.get("templateId") ?? "") || null,
      categoryId: String(formData.get("categoryId") ?? "") || null,
      versions: {
        create: {
          ...data,
          version: 1,
          status,
          changeNote: "Initial version",
          createdById: user.id
        }
      }
    }
  });

  revalidatePath("/dashboard");
  redirect("/dashboard?created=question");
}

export async function createTemplateAction(formData: FormData) {
  await requireRole([Role.ADMIN]);

  await prisma.questionTemplate.create({
    data: {
      name: String(formData.get("name") ?? "New template"),
      description: String(formData.get("description") ?? ""),
      type: String(formData.get("type") ?? QuestionType.CODING) as QuestionType,
      scaffold: {
        sections: String(formData.get("sections") ?? "Problem,Examples,Solution")
          .split(",")
          .map((section) => section.trim())
          .filter(Boolean)
      }
    }
  });

  revalidatePath("/admin");
  redirect("/admin?created=template");
}

export async function createCategoryAction(formData: FormData) {
  await requireRole([Role.ADMIN]);

  const name = String(formData.get("name") ?? "New category").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);

  await prisma.category.create({
    data: {
      name,
      slug,
      description: String(formData.get("description") ?? "") || null
    }
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/questions");
  redirect("/admin?created=category");
}

async function updateQuestionStatus(formData: FormData, status: QuestionStatus) {
  await requireRole([Role.ADMIN]);
  const questionId = String(formData.get("questionId"));
  const versionValue = formData.get("version");

  if (status === QuestionStatus.PUBLISHED && versionValue) {
    const version = await prisma.questionVersion.findUnique({
      where: { questionId_version: { questionId, version: Number(versionValue) } }
    });
    if (!version) redirect("/admin?error=missing-version");

    await prisma.question.update({
      where: { id: questionId },
      data: {
        title: version.title,
        summary: version.summary,
        company: version.company,
        difficulty: version.difficulty,
        type: version.type,
        tags: version.tags,
        promptMd: version.promptMd,
        solutionMd: version.solutionMd,
        videoUrl: version.videoUrl,
        starterCode: version.starterCode,
        status,
        currentVersion: version.version,
        publishedVersion: version.version,
        versions: {
          update: {
            where: { questionId_version: { questionId, version: version.version } },
            data: { status }
          }
        }
      }
    });
  } else {
    await prisma.question.update({
      where: { id: questionId },
      data: { status }
    });
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/questions");
}

export async function approveQuestionAction(formData: FormData) {
  await updateQuestionStatus(formData, QuestionStatus.PUBLISHED);
  redirect("/admin?updated=approved");
}

export async function archiveQuestionAction(formData: FormData) {
  await updateQuestionStatus(formData, QuestionStatus.ARCHIVED);
  redirect("/admin?updated=archived");
}

export async function updateUserRoleAction(formData: FormData) {
  const admin = await requireRole([Role.ADMIN]);
  const userId = String(formData.get("userId"));
  const role = String(formData.get("role")) as Role;

  if (!Object.values(Role).includes(role)) redirect("/admin?error=invalid-role");
  if (userId === admin.id && role !== Role.ADMIN) redirect("/admin?error=cannot-demote-self");

  await prisma.user.update({
    where: { id: userId },
    data: { role }
  });

  revalidatePath("/admin");
  redirect("/admin?updated=role");
}

export async function createQuestionVersionAction(formData: FormData) {
  const user = await requireRole([Role.CONTRIBUTOR, Role.ADMIN]);
  const questionId = String(formData.get("questionId"));
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) redirect("/dashboard?error=missing-question");
  if (user.role !== Role.ADMIN && question.authorId !== user.id) redirect("/dashboard?error=not-owner");

  const nextVersion = question.currentVersion + 1;
  const versionStatus = user.role === Role.ADMIN ? QuestionStatus.PUBLISHED : QuestionStatus.REVIEW;
  const questionStatus = user.role === Role.ADMIN ? QuestionStatus.PUBLISHED : question.status;
  const data = {
    title: String(formData.get("title") ?? question.title),
    summary: String(formData.get("summary") ?? question.summary),
    company: String(formData.get("company") ?? "") || null,
    difficulty: String(formData.get("difficulty") ?? question.difficulty) as Difficulty,
    type: String(formData.get("type") ?? question.type) as QuestionType,
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    promptMd: String(formData.get("promptMd") ?? question.promptMd),
    solutionMd: String(formData.get("solutionMd") ?? "") || null,
    videoUrl: String(formData.get("videoUrl") ?? "") || null,
    starterCode: String(formData.get("starterCode") ?? "") || null
  };

  await prisma.question.update({
    where: { id: questionId },
    data: {
      currentVersion: nextVersion,
      status: questionStatus,
      categoryId: String(formData.get("categoryId") ?? "") || null,
      templateId: String(formData.get("templateId") ?? "") || null,
      ...(versionStatus === QuestionStatus.PUBLISHED ? { ...data, publishedVersion: nextVersion } : {}),
      versions: {
        create: {
          ...data,
          version: nextVersion,
          status: versionStatus,
          changeNote: String(formData.get("changeNote") ?? "") || null,
          createdById: user.id
        }
      }
    }
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/questions");
  revalidatePath(`/practice/${question.slug}`);
  redirect(`/dashboard?updated=version-${nextVersion}`);
}

export async function saveAttemptAction(formData: FormData) {
  const user = await requireUser();

  await prisma.attempt.create({
    data: {
      userId: user.id,
      questionId: String(formData.get("questionId")),
      code: String(formData.get("code") ?? ""),
      notes: String(formData.get("notes") ?? "") || null
    }
  });

  revalidatePath("/dashboard");
  redirect(`/practice/${formData.get("slug")}?saved=1`);
}
