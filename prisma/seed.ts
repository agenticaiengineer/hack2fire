import { PrismaClient, Role, Difficulty, QuestionStatus, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUser(name: string, email: string, role: Role) {
  return prisma.user.upsert({
    where: { email },
    update: { name, role },
    create: {
      name,
      email,
      role,
      passwordHash: await bcrypt.hash("Hack2Fire!2026", 12)
    }
  });
}

async function main() {
  const [admin, contributor] = await Promise.all([
    upsertUser("Avery Admin", "admin@hack2fire.com", Role.ADMIN),
    upsertUser("Casey Contributor", "contributor@hack2fire.com", Role.CONTRIBUTOR),
    upsertUser("Jordan Learner", "user@hack2fire.com", Role.END_USER)
  ]);

  const codingTemplate = await prisma.questionTemplate.upsert({
    where: { id: "coding-template" },
    update: {},
    create: {
      id: "coding-template",
      name: "Coding Practice",
      description: "Algorithm prompt with starter code, constraints, examples, and test cases.",
      type: QuestionType.CODING,
      scaffold: {
        sections: ["Problem", "Examples", "Constraints", "Follow-ups", "Solution"],
        languages: ["typescript", "python", "java"]
      }
    }
  });

  const videoTemplate = await prisma.questionTemplate.upsert({
    where: { id: "video-template" },
    update: {},
    create: {
      id: "video-template",
      name: "Video Walkthrough",
      description: "Markdown lesson with embedded external video and discussion prompts.",
      type: QuestionType.MIXED,
      scaffold: {
        sections: ["Context", "Watch", "Practice", "Review"],
        videoProviders: ["youtube", "vimeo", "azure-media-services"]
      }
    }
  });

  const codingCategory = await prisma.category.upsert({
    where: { slug: "coding-practice" },
    update: {},
    create: {
      name: "Coding Practice",
      slug: "coding-practice",
      description: "Algorithm and data structure interview drills with starter code."
    }
  });

  const systemDesignCategory = await prisma.category.upsert({
    where: { slug: "system-design" },
    update: {},
    create: {
      name: "System Design",
      slug: "system-design",
      description: "Architecture, scalability, and tradeoff prompts."
    }
  });

  await prisma.category.upsert({
    where: { slug: "behavioral" },
    update: {},
    create: {
      name: "Behavioral",
      slug: "behavioral",
      description: "Leadership, collaboration, and career story practice."
    }
  });

  await prisma.question.upsert({
    where: { slug: "rate-limited-event-stream" },
    update: {
      categoryId: codingCategory.id,
      templateId: codingTemplate.id,
      currentVersion: 1,
      publishedVersion: 1
    },
    create: {
      title: "Rate Limited Event Stream",
      slug: "rate-limited-event-stream",
      summary: "Design an iterator that emits events while respecting per-customer rate limits.",
      company: "Platform Infra",
      difficulty: Difficulty.MEDIUM,
      type: QuestionType.CODING,
      status: QuestionStatus.PUBLISHED,
      tags: ["heap", "queue", "rate-limiting", "systems"],
      promptMd: `## Problem\n\nYou receive events as \`{ customerId, timestamp, payload }\`. Return the events that should be processed when each customer may emit at most **3 events per 10 seconds**. Preserve original order among accepted events.\n\n### Example\n\n| input customer sequence | accepted |\n| --- | --- |\n| A A A A B A | A A A B |\n\n### Follow-ups\n\n- How would this change for millions of customers?\n- Where should state live in a distributed worker pool?`,
      solutionMd: `Use a per-customer queue of accepted timestamps. Before accepting a new event, drop timestamps older than the rolling window. If fewer than three remain, accept and append the current timestamp.\n\nComplexity is $O(n)$ time and $O(c \cdot k)$ memory where $c$ is active customers and $k$ is the limit.`,
      starterCode: `type Event = { customerId: string; timestamp: number; payload: string };\n\nexport function filterEvents(events: Event[]): Event[] {\n  // Implement a rolling-window limiter per customer.\n  return [];\n}`,
      testCases: [
        { input: "A@0 A@1 A@2 A@3 B@4 A@11", expected: "A@0 A@1 A@2 B@4 A@11" }
      ],
      authorId: contributor.id,
      templateId: codingTemplate.id,
      categoryId: codingCategory.id,
      versions: {
        create: {
          version: 1,
          status: QuestionStatus.PUBLISHED,
          title: "Rate Limited Event Stream",
          summary: "Design an iterator that emits events while respecting per-customer rate limits.",
          company: "Platform Infra",
          difficulty: Difficulty.MEDIUM,
          type: QuestionType.CODING,
          tags: ["heap", "queue", "rate-limiting", "systems"],
          promptMd: `## Problem\n\nYou receive events as \`{ customerId, timestamp, payload }\`. Return the events that should be processed when each customer may emit at most **3 events per 10 seconds**. Preserve original order among accepted events.\n\n### Example\n\n| input customer sequence | accepted |\n| --- | --- |\n| A A A A B A | A A A B |\n\n### Follow-ups\n\n- How would this change for millions of customers?\n- Where should state live in a distributed worker pool?`,
          solutionMd: `Use a per-customer queue of accepted timestamps. Before accepting a new event, drop timestamps older than the rolling window. If fewer than three remain, accept and append the current timestamp.\n\nComplexity is $O(n)$ time and $O(c \cdot k)$ memory where $c$ is active customers and $k$ is the limit.`,
          starterCode: `type Event = { customerId: string; timestamp: number; payload: string };\n\nexport function filterEvents(events: Event[]): Event[] {\n  // Implement a rolling-window limiter per customer.\n  return [];\n}`,
          changeNote: "Initial version",
          createdById: contributor.id
        }
      }
    }
  });

  await prisma.question.upsert({
    where: { slug: "news-feed-fanout-review" },
    update: {
      categoryId: systemDesignCategory.id,
      templateId: videoTemplate.id,
      currentVersion: 1,
      publishedVersion: 1
    },
    create: {
      title: "News Feed Fanout Review",
      slug: "news-feed-fanout-review",
      summary: "Compare fanout-on-write and fanout-on-read for a social feed under spiky celebrity traffic.",
      company: "Consumer Social",
      difficulty: Difficulty.HARD,
      type: QuestionType.MIXED,
      status: QuestionStatus.PUBLISHED,
      tags: ["system-design", "feeds", "caching", "markdown"],
      promptMd: `## Scenario\n\nA social app serves personalized feeds. Most users have under 500 followers, but a small group has over 20 million. Design a feed system that keeps median read latency under 150 ms.\n\n### Cover\n\n- Data model\n- Fanout strategy\n- Cache invalidation\n- Backfill and retry behavior`,
      solutionMd: `A strong answer usually proposes a hybrid model: fanout-on-write for ordinary users, fanout-on-read or celebrity lanes for high-follower publishers, and precomputed feed slices cached near the read path.`,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      authorId: admin.id,
      templateId: videoTemplate.id,
      categoryId: systemDesignCategory.id,
      versions: {
        create: {
          version: 1,
          status: QuestionStatus.PUBLISHED,
          title: "News Feed Fanout Review",
          summary: "Compare fanout-on-write and fanout-on-read for a social feed under spiky celebrity traffic.",
          company: "Consumer Social",
          difficulty: Difficulty.HARD,
          type: QuestionType.MIXED,
          tags: ["system-design", "feeds", "caching", "markdown"],
          promptMd: `## Scenario\n\nA social app serves personalized feeds. Most users have under 500 followers, but a small group has over 20 million. Design a feed system that keeps median read latency under 150 ms.\n\n### Cover\n\n- Data model\n- Fanout strategy\n- Cache invalidation\n- Backfill and retry behavior`,
          solutionMd: `A strong answer usually proposes a hybrid model: fanout-on-write for ordinary users, fanout-on-read or celebrity lanes for high-follower publishers, and precomputed feed slices cached near the read path.`,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          changeNote: "Initial version",
          createdById: admin.id
        }
      }
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
