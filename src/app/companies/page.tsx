import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { QuestionStatus } from "@prisma/client";
import { companySlug } from "@/lib/company";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const questions = await prisma.question.findMany({
    where: { status: QuestionStatus.PUBLISHED, company: { not: null } },
    include: { category: true },
    orderBy: [{ company: "asc" }, { updatedAt: "desc" }]
  });

  const companies = new Map<string, { count: number; categories: Set<string> }>();
  for (const question of questions) {
    if (!question.company) continue;
    const current = companies.get(question.company) ?? { count: 0, categories: new Set<string>() };
    current.count += 1;
    current.categories.add(question.category?.name ?? "Uncategorized");
    companies.set(question.company, current);
  }

  return (
    <main className="shell section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Company view</p>
          <h1>Practice by company</h1>
          <p className="lede">Browse published questions grouped by company, then drill into categories for each interview loop.</p>
        </div>
      </div>
      <div className="company-grid">
        {[...companies.entries()].map(([company, data]) => (
          <Link className="company-card" href={`/companies/${companySlug(company)}`} key={company}>
            <span className="icon-tile blue"><Building2 size={22} /></span>
            <h3>{company}</h3>
            <p className="muted">{data.count} questions across {[...data.categories].length} categories</p>
            <div className="meta">{[...data.categories].slice(0, 4).map((category) => <span className="badge" key={category}>{category}</span>)}</div>
            <span className="company-link">View company <ArrowRight size={16} /></span>
          </Link>
        ))}
      </div>
    </main>
  );
}
