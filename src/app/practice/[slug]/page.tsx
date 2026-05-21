import { notFound } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { saveAttemptAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { difficultyClass } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { MarkdownView } from "@/components/MarkdownView";

export const dynamic = "force-dynamic";

export default async function PracticePage({ params, searchParams }: { params: { slug: string }; searchParams: { saved?: string } }) {
  const [question, user] = await Promise.all([
    prisma.question.findUnique({ where: { slug: params.slug }, include: { template: true, author: true, category: true } }),
    getSessionUser()
  ]);
  const canPreview = user?.role === Role.ADMIN;
  if (!question || (question.status !== "PUBLISHED" && !canPreview)) notFound();

  return (
    <main className="shell practice-layout">
      <section className="panel">
        <p className="eyebrow">{question.type.toLowerCase().replace("_", " ")}</p>
        <h1>{question.title}</h1>
        <div className="meta">
          <span className={difficultyClass(question.difficulty)}>{question.difficulty.toLowerCase()}</span>
          {question.status !== "PUBLISHED" ? <span className="badge red">{question.status.toLowerCase()}</span> : null}
          <span className="badge">v{question.publishedVersion}</span>
          {question.category ? <span className="badge">{question.category.name}</span> : null}
          {question.company ? <span className="badge">{question.company}</span> : null}
          {question.tags.map((tag) => <span className="badge" key={tag}>{tag}</span>)}
        </div>
        {question.videoUrl ? <iframe className="video-frame" src={question.videoUrl} title={`${question.title} video`} allowFullScreen /> : null}
        <MarkdownView content={question.promptMd} />
        {question.solutionMd ? <><h2>Solution notes</h2><MarkdownView content={question.solutionMd} /></> : null}
      </section>
      <aside className="panel sidebar">
        <p className="eyebrow">Coding workspace</p>
        {searchParams.saved ? <p className="badge green">Attempt saved</p> : null}
        {user ? (
          <form className="form-stack" action={saveAttemptAction}>
            <input type="hidden" name="questionId" value={question.id} />
            <input type="hidden" name="slug" value={question.slug} />
            <label className="field">Code<textarea className="code" name="code" defaultValue={question.starterCode ?? "// Write your approach here"} /></label>
            <label className="field">Notes<textarea name="notes" placeholder="Complexity, edge cases, follow-up ideas" /></label>
            <button className="primary-button" type="submit">Save attempt</button>
          </form>
        ) : (
          <div className="stack">
            <p className="muted">Log in to save attempts and track practice history.</p>
            <Link className="primary-button" href="/login">Log in</Link>
          </div>
        )}
      </aside>
    </main>
  );
}
