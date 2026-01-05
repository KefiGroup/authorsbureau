import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 999): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-ai-user-${userId}`,
    email: `aitest${userId}@example.com`,
    name: `AI Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("AI Generation - Book Outline", () => {
  it("generates a book outline with valid structure", async () => {
    const { ctx } = createAuthContext(1001);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.generateOutline({
      disasterMoment: "Lost my business to bankruptcy and hit rock bottom financially",
      transformation: "Rebuilt from scratch using new strategies and mindset",
      currentState: "Successfully running a profitable business and helping others",
      lessonLearned: "Failure is not the end, it's the beginning of wisdom",
      targetAudience: "Entrepreneurs facing financial challenges",
      uniqueAngle: "Practical recovery strategies from someone who's been there",
    });

    expect(result).toBeDefined();
    expect(result.outline).toBeDefined();
    expect(typeof result.outline).toBe("string");
    expect(result.outline.length).toBeGreaterThan(50);
  }, 45000); // 45 second timeout for AI generation
});

describe("AI Generation - SUCKcess Profile", () => {
  it("generates a personalized SUCKcess profile", async () => {
    const { ctx } = createAuthContext(1002);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.generateProfile({
      name: "Jane Doe",
      biggestChallenge: "career",
      currentStatus: "transformed",
      desiredImpact: "inspire",
      writingExperience: "beginner",
    });

    expect(result).toBeDefined();
    expect(result.profile).toBeDefined();
    expect(typeof result.profile).toBe("string");
    expect(result.profile.length).toBeGreaterThan(100);
  }, 45000);
});

describe("AI Generation - Chapter Draft", () => {
  it("generates a chapter draft based on outline", async () => {
    const { ctx } = createAuthContext(1003);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.generateChapter({
      bookTitle: "From Disaster to Success",
      chapterNumber: 1,
      chapterTitle: "The Day Everything Fell Apart",
      chapterOutline: "Describe the moment of crisis and the emotional impact.",
    });

    expect(result).toBeDefined();
    expect(result.draft).toBeDefined();
    expect(typeof result.draft).toBe("string");
    expect(result.draft.length).toBeGreaterThan(100);
  }, 45000);
});
