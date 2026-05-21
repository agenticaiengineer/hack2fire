import { Role } from "@prisma/client";
import { archiveQuestionAction, approveQuestionAction, createCategoryAction, createTemplateAction, updateUserRoleAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireRole([Role.ADMIN]);
  const [templates, categories, questions, users] = await Promise.all([
    prisma.questionTemplate.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ include: { _count: { select: { questions: true } } }, orderBy: { name: "asc" } }),
    prisma.question.findMany({ include: { author: true, category: true, versions: { orderBy: { version: "desc" }, take: 3, include: { createdBy: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  return (
    <main className="shell dashboard">
      <aside className="panel sidebar">
        <p className="eyebrow">Admin</p>
        <h1>Control room</h1>
        <p className="muted">Categories organize the catalog. Templates standardize question creation across coding, video, and mixed lessons.</p>
      </aside>
      <section className="stack">
        <div className="panel">
          <p className="eyebrow">Categories</p>
          <h2>Add category</h2>
          <form className="form-stack" action={createCategoryAction}>
            <div className="grid-2">
              <label className="field">Name<input name="name" required /></label>
              <label className="field">Slug<input name="slug" placeholder="Optional, generated from name" /></label>
            </div>
            <label className="field">Description<input name="description" placeholder="What belongs in this category?" /></label>
            <button className="primary-button" type="submit">Create category</button>
          </form>
        </div>
        <div className="panel">
          <p className="eyebrow">Templates</p>
          <h2>Add question template</h2>
          <form className="form-stack" action={createTemplateAction}>
            <div className="grid-2">
              <label className="field">Name<input name="name" required /></label>
              <label className="field">Type<select name="type"><option>CODING</option><option>SYSTEM_DESIGN</option><option>BEHAVIORAL</option><option>VIDEO</option><option>MIXED</option></select></label>
            </div>
            <label className="field">Description<input name="description" required /></label>
            <label className="field">Sections<input name="sections" defaultValue="Problem,Examples,Constraints,Follow-ups,Solution" /></label>
            <button className="primary-button" type="submit">Create template</button>
          </form>
        </div>
        <div className="grid-2">
          <div className="panel">
            <p className="eyebrow">Existing categories</p>
            {categories.map((category) => <p key={category.id}><strong>{category.name}</strong> <span className="badge">{category._count.questions} questions</span><br /><span className="muted">/{category.slug}{category.description ? ` - ${category.description}` : ""}</span></p>)}
          </div>
          <div className="panel">
            <p className="eyebrow">Existing templates</p>
            {templates.map((template) => <p key={template.id}><strong>{template.name}</strong><br /><span className="muted">{template.description}</span></p>)}
          </div>
        </div>
        <div className="grid-2">
          <div className="panel">
            <p className="eyebrow">Users</p>
            <div className="user-role-list">
              {users.map((user) => (
                <form className="user-role-row" action={updateUserRoleAction} key={user.id}>
                  <input type="hidden" name="userId" value={user.id} />
                  <div>
                    <strong>{user.name}</strong>
                    <p className="muted">{user.email}</p>
                  </div>
                  <select name="role" defaultValue={user.role} aria-label={`Role for ${user.name}`}>
                    <option value="END_USER">End user</option>
                    <option value="CONTRIBUTOR">Contributor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button className="secondary-button small" type="submit">Update role</button>
                </form>
              ))}
            </div>
          </div>
        </div>
        <div className="panel">
          <p className="eyebrow">Question review</p>
          <h2>Latest questions</h2>
          <div className="question-list">
            {questions.map((question) => (
              <article className="question-row" key={question.id}>
                <div>
                  <h3>{question.title}</h3>
                  <p className="muted">{question.summary}</p>
                  <div className="meta">
                    {question.category ? <span className="badge">{question.category.name}</span> : null}
                    <span className="badge">{question.status.toLowerCase()}</span>
                    <span className="badge">live v{question.publishedVersion}</span>
                    <span className="badge">latest v{question.currentVersion}</span>
                    <span className="badge">{question.difficulty.toLowerCase()}</span>
                    <span className="muted">by {question.author.name}</span>
                  </div>
                  {question.versions.length > 0 ? (
                    <div className="version-list">
                      {question.versions.map((version) => (
                        <div key={version.id} className="version-row">
                          <a href={`/admin/questions/${question.slug}/versions/${version.version}`} className="badge">v{version.version}</a>
                          <span className="badge">{version.status.toLowerCase()}</span>
                          <span className="muted">{version.changeNote || "No change note"} by {version.createdBy.name}</span>
                          {version.status !== "PUBLISHED" ? (
                            <form action={approveQuestionAction}>
                              <input type="hidden" name="questionId" value={question.id} />
                              <input type="hidden" name="version" value={version.version} />
                              <button className="primary-button small" type="submit">Publish v{version.version}</button>
                            </form>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="review-actions">
                  <a className="secondary-button small" href={`/practice/${question.slug}`}>Preview</a>
                  <a className="secondary-button small" href={`/questions/${question.slug}/edit`}>Edit</a>
                  {question.status !== "PUBLISHED" ? (
                    <form action={approveQuestionAction}>
                      <input type="hidden" name="questionId" value={question.id} />
                      <input type="hidden" name="version" value={question.currentVersion} />
                      <button className="primary-button small" type="submit">Publish</button>
                    </form>
                  ) : null}
                  {question.status !== "ARCHIVED" ? (
                    <form action={archiveQuestionAction}>
                      <input type="hidden" name="questionId" value={question.id} />
                      <button className="ghost-button small" type="submit">Archive</button>
                    </form>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
