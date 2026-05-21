import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Difficulty } from "@prisma/client";
import { difficultyClass } from "@/lib/format";

type QuestionCardProps = {
  question: {
    title: string;
    slug: string;
    summary: string;
    company: string | null;
    difficulty: Difficulty;
    tags: string[];
    category?: { name: string } | null;
  };
};

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <article className="question-row">
      <div>
        <h3>{question.title}</h3>
        <p className="muted">{question.summary}</p>
        <div className="meta">
          <span className={difficultyClass(question.difficulty)}>{question.difficulty.toLowerCase()}</span>
          {question.category ? <span className="badge">{question.category.name}</span> : null}
          {question.company ? <span className="badge">{question.company}</span> : null}
          {question.tags.slice(0, 4).map((tag) => <span className="badge" key={tag}>{tag}</span>)}
        </div>
      </div>
      <Link className="secondary-button" href={`/practice/${question.slug}`} aria-label={`Practice ${question.title}`}>
        Practice <ArrowRight size={16} />
      </Link>
    </article>
  );
}
