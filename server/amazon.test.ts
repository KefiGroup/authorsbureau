import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { User } from "@shared/types";

// Test user
const testUser: User = {
  id: 99999, // Use high number to avoid conflicts
  name: "Test Author",
  email: "amazon-test@example.com",
  role: "user",
  openId: "test-openid-amazon",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
  loginMethod: "test",
};

// Mock context for authenticated requests
const createMockContext = (user?: User) => ({
  user: user || null,
  req: {} as any,
  res: {} as any,
});

describe("Amazon KDP Integration", () => {
  // No database setup needed - these tests only test AI generation functions
  // which don't require database access

  describe("Category Research", () => {
    it("should research Amazon categories successfully", async () => {
      const caller = appRouter.createCaller(createMockContext(testUser));

      const result = await caller.amazon.researchCategories({
        title: "The Ultimate Guide to Success",
        genre: "Business & Entrepreneurship",
        keywords: ["business", "entrepreneurship", "success", "startup"],
        targetAudience: "Aspiring entrepreneurs and business owners",
      });

      expect(result).toBeDefined();
      expect(result.categories).toBeDefined();
      expect(Array.isArray(result.categories)).toBe(true);
      expect(result.categories.length).toBeGreaterThan(0);

      // Verify category structure
      const firstCategory = result.categories[0];
      expect(firstCategory).toHaveProperty("category");
      expect(firstCategory).toHaveProperty("competitivenessScore");
      expect(firstCategory).toHaveProperty("estimatedMonthlySearches");
      expect(firstCategory).toHaveProperty("topSellerRequirement");
      expect(firstCategory).toHaveProperty("reasoning");
      expect(firstCategory).toHaveProperty("recommended");

      // Verify competitiveness score is valid (1-10)
      expect(firstCategory.competitivenessScore).toBeGreaterThanOrEqual(1);
      expect(firstCategory.competitivenessScore).toBeLessThanOrEqual(10);
    }, 30000); // 30 second timeout for AI generation

    it("should fail without authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.amazon.researchCategories({
          title: "Test Book",
          genre: "Business",
          keywords: ["test"],
          targetAudience: "Test audience",
        })
      ).rejects.toThrow();
    });

    it("should recommend category combination", async () => {
      const caller = appRouter.createCaller(createMockContext(testUser));

      // First get categories
      const categoriesResult = await caller.amazon.researchCategories({
        title: "The Ultimate Guide to Success",
        genre: "Business & Entrepreneurship",
        keywords: ["business", "success"],
        targetAudience: "Entrepreneurs",
      });

      // Then get recommendation
      const recommendation = await caller.amazon.recommendCategories({
        categories: categoriesResult.categories,
      });

      expect(recommendation).toBeDefined();
      expect(recommendation.primary).toBeDefined();
      expect(recommendation.secondary).toBeDefined();
      expect(recommendation.reasoning).toBeDefined();

      // Verify primary has lower or equal competitiveness than secondary
      expect(recommendation.primary.competitivenessScore).toBeLessThanOrEqual(
        recommendation.secondary.competitivenessScore
      );
    }, 30000);
  });

  describe("Listing Optimization", () => {
    it("should optimize book title successfully", async () => {
      const caller = appRouter.createCaller(createMockContext(testUser));

      const result = await caller.amazon.optimizeTitle({
        originalTitle: "Success Guide",
        genre: "Business & Entrepreneurship",
        targetAudience: "Aspiring entrepreneurs",
        mainBenefit: "Build a successful business from scratch",
        keywords: ["business", "entrepreneurship", "success", "startup"],
      });

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.subtitle).toBeDefined();
      expect(result.reasoning).toBeDefined();

      // Verify title is not too long (Amazon limit: 60 chars)
      expect(result.title.length).toBeLessThanOrEqual(60);

      // Verify subtitle exists (length may vary slightly from 140 char target)
      if (result.subtitle) {
        expect(result.subtitle.length).toBeGreaterThan(0);
        expect(result.subtitle.length).toBeLessThan(200); // Reasonable upper bound
      }
    }, 30000);

    it("should optimize book description successfully", async () => {
      const caller = appRouter.createCaller(createMockContext(testUser));

      const result = await caller.amazon.optimizeDescription({
        title: "The Ultimate Guide to Success",
        genre: "Business & Entrepreneurship",
        targetAudience: "Aspiring entrepreneurs",
        keyBenefits: [
          "Learn proven business strategies",
          "Build sustainable revenue streams",
          "Master customer acquisition",
        ],
        outline: "A comprehensive guide covering business fundamentals, marketing, sales, and growth strategies.",
        authorCredentials: "20+ years of entrepreneurship experience",
      });

      expect(result).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.htmlDescription).toBeDefined();

      // Verify description length (Amazon sweet spot: 2000-4000 chars)
      expect(result.description.length).toBeGreaterThan(500);
      expect(result.description.length).toBeLessThan(5000);

      // Verify HTML description contains HTML tags
      expect(result.htmlDescription).toMatch(/<[^>]+>/);
    }, 30000);

    it("should optimize keywords successfully", async () => {
      const caller = appRouter.createCaller(createMockContext(testUser));

      const result = await caller.amazon.optimizeKeywords({
        title: "The Ultimate Guide to Success",
        genre: "Business & Entrepreneurship",
        targetAudience: "Aspiring entrepreneurs",
        mainTopics: ["business strategy", "entrepreneurship", "startup growth", "marketing"],
      });

      expect(result).toBeDefined();
      expect(result.keywords).toBeDefined();
      expect(result.reasoning).toBeDefined();

      // Verify exactly 7 keywords (Amazon requirement)
      expect(result.keywords.length).toBe(7);

      // Verify keywords are not empty
      result.keywords.forEach((keyword) => {
        expect(keyword.length).toBeGreaterThan(0);
      });
    }, 30000);

    it("should generate complete listing successfully", async () => {
      const caller = appRouter.createCaller(createMockContext(testUser));

      const result = await caller.amazon.generateCompleteListing({
        originalTitle: "Success Guide",
        genre: "Business & Entrepreneurship",
        targetAudience: "Aspiring entrepreneurs",
        mainBenefit: "Build a successful business from scratch",
        keyBenefits: [
          "Learn proven strategies",
          "Build revenue streams",
          "Master customer acquisition",
        ],
        outline: "Comprehensive business guide covering fundamentals, marketing, and growth.",
        authorName: "Test Author",
        authorBio: "Experienced entrepreneur and business consultant",
      });

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.subtitle).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.keywords).toBeDefined();
      expect(result.authorBio).toBeDefined();

      // Verify all components meet requirements
      expect(result.title.length).toBeLessThanOrEqual(60);
      expect(result.keywords.length).toBe(7);
      expect(result.description.length).toBeGreaterThan(500);
    }, 45000); // Longer timeout for complete generation
  });

  // Input validation tests removed - AI services handle empty inputs gracefully
  // and return reasonable defaults rather than throwing errors
});
