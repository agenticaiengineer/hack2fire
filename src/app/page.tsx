import Link from "next/link";
import { ArrowRight, BookOpen, Code2, GitBranch, Layers, PlayCircle, ShieldCheck, Users } from "lucide-react";
import { QuestionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { QuestionCard } from "@/components/QuestionCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const questions = await prisma.question.findMany({
    where: { status: QuestionStatus.PUBLISHED },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
    take: 3
  });

  return (
    <main>
      <section className="hero-band">
        <div className="shell hero-centered">
          <div className="side-mockup left-mockup" aria-hidden="true">
            <div className="mini-editor">
              <span className="mini-chip">v3 review</span>
              <strong>Graph Reachability</strong>
              <code>visited.add(node)</code>
              <code>queue.push(next)</code>
            </div>
          </div>
          <div className="hero-copy">
            <p className="eyebrow">hack2fire.com</p>
            <h1><span>Real interview</span><span>question bank</span></h1>
            <p className="lede">
              Practice company-style coding, system design, video, and Markdown prompts with role-based contribution, review, and versioned content publishing.
            </p>
            <div className="hero-actions">
              <Link className="primary-button" href="/questions">See questions <ArrowRight size={18} /></Link>
              <Link className="secondary-button" href="/login"><Users size={18} /> Try demo roles</Link>
            </div>
          </div>
          <div className="side-mockup right-mockup" aria-hidden="true">
            <div className="phone-shell">
              <span className="badge green">Published v2</span>
              <h3>Rate Limited Stream</h3>
              <p>Prompt, hints, solution, and saved attempt.</p>
              <div className="phone-bars"><span /><span /><span /></div>
            </div>
          </div>
        </div>

        <div className="shell feature-float-grid">
          <div className="feature-glass"><span className="icon-tile red"><Code2 size={22} /></span><h3>Realistic prompts</h3><p>Company-flavored drills with examples, constraints, follow-ups, and rich Markdown.</p></div>
          <div className="feature-glass"><span className="icon-tile blue"><Layers size={22} /></span><h3>Versioned solutions</h3><p>Every edit creates a new content version that admins can review and publish.</p></div>
          <div className="feature-glass"><span className="icon-tile green"><Users size={22} /></span><h3>Community workflow</h3><p>Contributors submit questions while admins manage categories, templates, and approvals.</p></div>
        </div>
      </section>

      <section className="career-strip">
        <div className="shell career-inner">
          <p><strong>Stay interview-ready</strong> across coding, systems, and behavioral loops.</p>
          <div className="company-row" aria-label="Target company practice categories">
            <span>Search</span><span>Cloud</span><span>Marketplaces</span><span>Payments</span><span>AI Platforms</span><span>Consumer Apps</span>
          </div>
        </div>
      </section>

      <section className="section white">
        <div className="shell">
          <div className="section-title">
            <div>
              <p className="eyebrow">Product workflow</p>
              <h2>From practice to reviewed content.</h2>
            </div>
          </div>
          <div className="feature-story">
            <div className="story-visual question-snapshot">
              <div className="snapshot-head"><span className="badge">Coding Practice</span><span className="badge amber">medium</span></div>
              <h3>Rate Limited Event Stream</h3>
              <p>Design an iterator that emits events while respecting per-customer windows.</p>
              <div className="snapshot-lines"><span /><span /><span /></div>
            </div>
            <div className="story-copy">
              <span className="icon-tile red"><BookOpen size={22} /></span>
              <h3>Practice top interview questions and stay ahead.</h3>
              <p className="muted">Browse curated categories, open a prompt, write notes and code, and track saved attempts without leaving the page.</p>
            </div>
          </div>
          <div className="feature-story reverse">
            <div className="story-visual review-snapshot">
              <div className="version-row"><span className="badge">v3</span><span className="badge amber">review</span><span>Improve edge cases</span></div>
              <div className="version-row"><span className="badge">v2</span><span className="badge green">published</span><span>Cleaner solution</span></div>
              <div className="version-row"><span className="badge">v1</span><span className="badge green">published</span><span>Initial prompt</span></div>
            </div>
            <div className="story-copy">
              <span className="icon-tile blue"><GitBranch size={22} /></span>
              <h3>Contributors can ship improvements without breaking live content.</h3>
              <p className="muted">New edits become reviewable versions. Admins preview, approve, archive, or publish a specific version.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="practice-preview-section">
        <div className="shell">
          <div className="section-title centered-title">
            <div>
              <p className="eyebrow">Stop scrolling. Start practicing.</p>
              <h2>One workspace for every question type.</h2>
            </div>
          </div>
          <div className="practice-tabs" aria-label="Practice modes">
            <span className="active">Coding Question</span>
            <span>System Design</span>
            <span>ML System Design</span>
            <span className="disabled">Behavioral</span>
          </div>
          <div className="product-visual large-visual" aria-label="Hack2Fire practice workspace preview">
            <div className="visual-toolbar"><span className="dot" /><span className="dot" /><span className="dot" /></div>
            <div className="visual-grid">
              <aside className="visual-list">
                <div className="visual-card active">Rate Limited Event Stream<span>coding / medium</span></div>
                <div className="visual-card">News Feed Fanout Review<span>system design / hard</span></div>
                <div className="visual-card">Debugging Ownership Loop<span>behavioral / mixed</span></div>
              </aside>
              <section className="visual-editor">
                <p className="eyebrow">Practice mode</p>
                <h2>Prompt, code, video, and solution notes in one workspace.</h2>
                <div className="code-window">
                  <div>type Event = &#123; customerId: string; timestamp: number &#125;;</div>
                  <br />
                  <div>export function filterEvents(events: Event[]) &#123;</div>
                  <div>&nbsp;&nbsp;const windows = new Map&lt;string, number[]&gt;();</div>
                  <div>&nbsp;&nbsp;return events.filter(event =&gt; accepts(event, windows));</div>
                  <div>&#125;</div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-title">
            <div>
              <p className="eyebrow">Question bank</p>
              <h2>Start with seeded practice content.</h2>
            </div>
            <Link className="secondary-button" href="/questions">Open catalog</Link>
          </div>
          <div className="question-list">
            {questions.map((question) => <QuestionCard key={question.id} question={question} />)}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="shell cta-inner">
          <div>
            <p className="eyebrow">Supercharge your interview loop</p>
            <h2>Practice, contribute, review, and publish in one platform.</h2>
          </div>
          <div className="hero-actions">
            <Link className="primary-button" href="/login"><ShieldCheck size={18} /> Log in</Link>
            <Link className="secondary-button" href="/questions"><PlayCircle size={18} /> Browse questions</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="shell footer-grid">
          <div><strong>Hack2Fire</strong><p>Role-based interview prep with versioned community content.</p></div>
          <div><span>Products</span><a href="/questions">Question bank</a><a href="/dashboard">Practice dashboard</a></div>
          <div><span>Content</span><a href="/admin">Admin review</a><a href="/login">Contributor login</a></div>
          <div><span>Platform</span><a href="/questions">Coding</a><a href="/questions">System design</a></div>
        </div>
      </footer>
    </main>
  );
}
