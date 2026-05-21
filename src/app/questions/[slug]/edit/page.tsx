import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { createQuestionVersionAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditQuestionPage({ params }: { params: { slug: string } }) {
  const user = await requireUser();
  const question = await prisma.question.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      template: true,
      versions: { orderBy: { version: "desc" }, take: 1 }
    }
  });
  if (!question) notFound();
  if (user.role !== Role.ADMIN && question.authorId !== user.id) redirect("/dashboard?error=not-owner");

  const [categories, templates] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.questionTemplate.findMany({ orderBy: { name: "asc" } })
  ]);
  const latest = question.versions[0];

  return (
    <main className="shell section">
      <section className="panel">
        <p className="eyebrow">New content version</p>
        <h1>Edit {question.title}</h1>
        <p className="muted">Current version: v{question.currentVersion}. Published version: v{question.publishedVersion}. Saving creates v{question.currentVersion + 1}.</p>
        <form className="form-stack" action={createQuestionVersionAction}>
          <input type="hidden" name="questionId" value={question.id} />
          <div className="grid-2">
            <label className="field">Title<input name="title" defaultValue={latest?.title ?? question.title} required /></label>
            <label className="field">Company/context<input name="company" defaultValue={latest?.company ?? question.company ?? ""} /></label>
          </div>
          <label className="field">Change note<input name="changeNote" placeholder="What changed in this version?" /></label>
          <label className="field">Summary<input name="summary" defaultValue={latest?.summary ?? question.summary} required /></label>
          <div className="grid-3">
            <label className="field">Difficulty<select name="difficulty" defaultValue={latest?.difficulty ?? question.difficulty}><option>EASY</option><option>MEDIUM</option><option>HARD</option></select></label>
            <label className="field">Type<select name="type" defaultValue={latest?.type ?? question.type}><option>CODING</option><option>SYSTEM_DESIGN</option><option>BEHAVIORAL</option><option>VIDEO</option><option>MIXED</option></select></label>
            <label className="field">Template<select name="templateId" defaultValue={question.templateId ?? ""}><option value="">None</option>{templates.map((template) => <option value={template.id} key={template.id}>{template.name}</option>)}</select></label>
          </div>
          <label className="field">Category<select name="categoryId" defaultValue={question.categoryId ?? ""}><option value="">Uncategorized</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
          <label className="field">Tags<input name="tags" defaultValue={(latest?.tags ?? question.tags).join(", ")} /></label>
          <label className="field">Prompt Markdown<textarea name="promptMd" required defaultValue={latest?.promptMd ?? question.promptMd} /></label>
          <label className="field">Solution Markdown<textarea name="solutionMd" defaultValue={latest?.solutionMd ?? question.solutionMd ?? ""} /></label>
          <label className="field">Video embed URL<input name="videoUrl" defaultValue={latest?.videoUrl ?? question.videoUrl ?? ""} /></label>
          <label className="field">Starter code<textarea className="code" name="starterCode" defaultValue={latest?.starterCode ?? question.starterCode ?? ""} /></label>
          <button className="primary-button" type="submit">Save new version</button>
        </form>
      </section>
    </main>
  );
}
