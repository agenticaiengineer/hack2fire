import { QuestionStatus } from "@prisma/client";
import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const questions = await prisma.question.findMany({
    where: { status: QuestionStatus.PUBLISHED },
    include: { category: true },
    orderBy: [{ difficulty: "asc" }, { updatedAt: "desc" }]
  });

  return (
    <main className="shell section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Question bank</p>
          <h1>Practice catalog</h1>
          <p className="lede">Published coding, system design, video, and mixed-format interview drills.</p>
        </div>
        <Link className="secondary-button" href="/companies">Group by company</Link>
      </div>
      <div className="question-list">
        {questions.map((question) => <QuestionCard key={question.id} question={question} />)}
      </div>
    </main>
  );
}
