import Link from "next/link";
import { Role } from "@prisma/client";
import { createQuestionAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roleLabel } from "@/lib/format";
import { QuestionCard } from "@/components/QuestionCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [questions, templates, categories, attempts, myQuestions] = await Promise.all([
    prisma.question.findMany({ where: { status: "PUBLISHED" }, include: { category: true }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.questionTemplate.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.attempt.findMany({ where: { userId: user.id }, include: { question: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.question.findMany({ where: { authorId: user.id }, include: { versions: { orderBy: { version: "desc" }, take: 1 } }, orderBy: { createdAt: "desc" }, take: 5 })
  ]);
  const canContribute = user.role === Role.CONTRIBUTOR || user.role === Role.ADMIN;

  return (
    <main className="shell dashboard">
      <aside className="panel sidebar">
        <p className="eyebrow">Dashboard</p>
        <h2>{user.name}</h2>
        <p><span className="role-pill">{roleLabel(user.role)}</span></p>
        <p className="muted">Use the seeded demo roles to verify learner, contributor, and admin permissions.</p>
        {user.role === Role.ADMIN ? <Link className="secondary-button" href="/admin">Open admin tools</Link> : null}
      </aside>

      <section className="stack">
        <div className="panel">
          <div className="section-title">
            <div><p className="eyebrow">Continue practice</p><h2>Published questions</h2></div>
            <Link className="secondary-button" href="/questions">All questions</Link>
          </div>
          <div className="question-list">
            {questions.map((question) => <QuestionCard key={question.id} question={question} />)}
          </div>
        </div>

        {canContribute ? (
          <div className="panel">
            <p className="eyebrow">Contributor studio</p>
            <h2>Add a question</h2>
            <form className="form-stack" action={createQuestionAction}>
              <div className="grid-2">
                <label className="field">Title<input name="title" required /></label>
                <label className="field">Company/context<input name="company" placeholder="Optional" /></label>
              </div>
              <label className="field">Summary<input name="summary" required /></label>
              <div className="grid-3">
                <label className="field">Difficulty<select name="difficulty" defaultValue="MEDIUM"><option>EASY</option><option>MEDIUM</option><option>HARD</option></select></label>
                <label className="field">Type<select name="type" defaultValue="CODING"><option>CODING</option><option>SYSTEM_DESIGN</option><option>BEHAVIORAL</option><option>VIDEO</option><option>MIXED</option></select></label>
                <label className="field">Template<select name="templateId"><option value="">None</option>{templates.map((template) => <option value={template.id} key={template.id}>{template.name}</option>)}</select></label>
              </div>
              <label className="field">Category<select name="categoryId"><option value="">Uncategorized</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
              <label className="field">Tags<input name="tags" placeholder="arrays, graph, system-design" /></label>
              <label className="field">Prompt Markdown<textarea name="promptMd" required defaultValue={"## Problem\n\nDescribe the interview prompt here.\n\n### Examples\n\n- Input:\n- Output:"} /></label>
              <label className="field">Solution Markdown<textarea name="solutionMd" defaultValue={"## Approach\n\nExplain the pattern, tradeoffs, and complexity."} /></label>
              <label className="field">Video embed URL<input name="videoUrl" placeholder="https://www.youtube.com/embed/..." /></label>
              <label className="field">Starter code<textarea className="code" name="starterCode" defaultValue={"export function solve(input: unknown) {\n  return input;\n}"} /></label>
              <button className="primary-button" type="submit">Submit question</button>
            </form>
          </div>
        ) : null}

        <div className="grid-2">
          <div className="panel">
            <p className="eyebrow">Attempts</p>
            <h3>Recent saves</h3>
            {attempts.length === 0 ? <p className="muted">No saved attempts yet.</p> : attempts.map((attempt) => <p key={attempt.id}><Link href={`/practice/${attempt.question.slug}`}>{attempt.question.title}</Link></p>)}
          </div>
          <div className="panel">
            <p className="eyebrow">Submissions</p>
            <h3>My questions</h3>
            {myQuestions.length === 0 ? <p className="muted">No contributed questions yet.</p> : myQuestions.map((question) => <p key={question.id}>{question.title} <span className="badge">{question.status.toLowerCase()}</span> <span className="badge">v{question.currentVersion}</span> <Link href={`/questions/${question.slug}/edit`}>Edit</Link></p>)}
          </div>
        </div>
      </section>
    </main>
  );
}
