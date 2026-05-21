import { notFound } from "next/navigation";
import Link from "next/link";
import { QuestionStatus } from "@prisma/client";
import { companyFromSlug, companySlug } from "@/lib/company";
import { prisma } from "@/lib/prisma";
import { QuestionCard } from "@/components/QuestionCard";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({ params }: { params: { company: string } }) {
  const questions = await prisma.question.findMany({
    where: { status: QuestionStatus.PUBLISHED, company: { not: null } },
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { difficulty: "asc" }, { updatedAt: "desc" }]
  });
  const companyQuestions = questions.filter((question) => question.company && companySlug(question.company) === params.company);
  if (companyQuestions.length === 0) notFound();

  const companyName = companyQuestions[0].company ?? companyFromSlug(params.company);
  const groups = new Map<string, typeof companyQuestions>();
  for (const question of companyQuestions) {
    const category = question.category?.name ?? "Uncategorized";
    groups.set(category, [...(groups.get(category) ?? []), question]);
  }

  return (
    <main className="shell section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Company practice</p>
          <h1>{companyName}</h1>
          <p className="lede">Questions grouped by category for focused interview preparation.</p>
        </div>
        <Link className="secondary-button" href="/companies">All companies</Link>
      </div>
      <div className="stack">
        {[...groups.entries()].map(([category, categoryQuestions]) => (
          <section className="panel" key={category}>
            <div className="section-title compact-title">
              <div>
                <p className="eyebrow">{category}</p>
                <h2>{categoryQuestions.length} questions</h2>
              </div>
            </div>
            <div className="question-list">
              {categoryQuestions.map((question) => <QuestionCard key={question.id} question={question} />)}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
