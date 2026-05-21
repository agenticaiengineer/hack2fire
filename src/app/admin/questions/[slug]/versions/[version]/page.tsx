import { notFound } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { approveQuestionAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { difficultyClass } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { MarkdownView } from "@/components/MarkdownView";

export const dynamic = "force-dynamic";

export default async function VersionPreviewPage({
  params,
}: {
  params: Promise<{ slug: string; version: string }>;
}) {
  await requireRole([Role.ADMIN]);
  const { slug, version: versionParam } = await params;
  const versionNum = Number(versionParam);

  const question = await prisma.question.findUnique({
    where: { slug },
    include: {
      category: true,
      versions: { orderBy: { version: "desc" }, include: { createdBy: true } },
    },
  });
  if (!question) notFound();

  const version = question.versions.find((v) => v.version === versionNum);
  if (!version) notFound();

  const isPublished = question.publishedVersion === versionNum;
  const isLatest = question.currentVersion === versionNum;

  return (
    <main className="shell practice-layout">
      <section className="panel">
        <div className="meta" style={{ marginBottom: "1rem" }}>
          <Link href="/admin" className="secondary-button small">&larr; Back to admin</Link>
        </div>
        <p className="eyebrow">Version preview — v{versionNum}</p>
        <h1>{version.title}</h1>
        <div className="meta">
          <span className={difficultyClass(version.difficulty)}>{version.difficulty.toLowerCase()}</span>
          <span className="badge">{version.status.toLowerCase()}</span>
          <span className="badge">{version.type.toLowerCase().replace("_", " ")}</span>
          {isPublished ? <span className="badge green">live</span> : null}
          {isLatest ? <span className="badge">latest</span> : null}
          {question.category ? <span className="badge">{question.category.name}</span> : null}
          {version.company ? <span className="badge">{version.company}</span> : null}
          {version.tags.map((tag) => <span className="badge" key={tag}>{tag}</span>)}
        </div>
        <p className="muted">
          by {version.createdBy.name} &middot; {version.createdAt.toLocaleDateString()}
          {version.changeNote ? ` · ${version.changeNote}` : ""}
        </p>
        <MarkdownView content={version.promptMd} />
        {version.solutionMd ? <><h2>Solution notes</h2><MarkdownView content={version.solutionMd} /></> : null}
        {version.starterCode ? <><h2>Starter code</h2><pre className="code">{version.starterCode}</pre></> : null}
      </section>
      <aside className="panel sidebar">
        <p className="eyebrow">Version actions</p>
        <p className="muted">
          Published: v{question.publishedVersion} · Latest: v{question.currentVersion}
        </p>
        <div className="stack">
          {question.versions.map((v) => (
            <Link
              key={v.id}
              href={`/admin/questions/${slug}/versions/${v.version}`}
              className={v.version === versionNum ? "primary-button small" : "secondary-button small"}
            >
              v{v.version} — {v.status.toLowerCase()}
              {question.publishedVersion === v.version ? " (live)" : ""}
            </Link>
          ))}
        </div>
        {!isPublished ? (
          <form action={approveQuestionAction} style={{ marginTop: "1rem" }}>
            <input type="hidden" name="questionId" value={question.id} />
            <input type="hidden" name="version" value={versionNum} />
            <button className="primary-button" type="submit">Publish v{versionNum}</button>
          </form>
        ) : (
          <p className="badge green" style={{ marginTop: "1rem" }}>This version is live</p>
        )}
      </aside>
    </main>
  );
}
