import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

/**
 * Test suite for manuscript variations feature
 * Tests the generateRewriteVariations API endpoint and markdown stripping functionality
 */

describe("Manuscript Variations Feature", () => {
  let testUser: AuthenticatedUser;
  let testBlueprintId: number;
  let testManuscriptId: number;

  beforeAll(async () => {
    // Create test user using upsertUser
    const testOpenId = `test-openid-${Date.now()}`;
    await db.upsertUser({
      name: "Test Author",
      email: `test-variations-${Date.now()}@example.com`,
      openId: testOpenId,
    });
    
    const user = await db.getUserByOpenId(testOpenId);
    if (!user) throw new Error("Failed to create test user");
    
    testUser = {
      id: user.id,
      openId: user.openId,
      email: user.email || "test@example.com",
      name: user.name || "Test Author",
      loginMethod: user.loginMethod || "manus",
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastSignedIn: user.lastSignedIn || new Date(),
    };

    // Create test blueprint
    const blueprint = await db.createStoryBlueprint({
      userId: testUser.id,
      projectType: "novel",
      workingTitle: "Test Novel for Variations",
    });
    testBlueprintId = blueprint.id;

    // Create test manuscript section
    const manuscript = await db.createManuscriptSection({
      blueprintId: testBlueprintId,
      sectionType: "chapter",
      sectionNumber: 1,
      title: "Chapter 1",
      content: "This is the original chapter content that we want to create variations for.",
      wordCount: 13,
      status: "approved",
    });
    testManuscriptId = manuscript.id;
  });

  it("should generate 3 variations with different creative approaches", async () => {
    const caller = appRouter.createCaller({
      user: testUser,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.manuscript.generateRewriteVariations({
      manuscriptId: testManuscriptId,
    });

    // Should return exactly 3 variations
    expect(result.variations).toHaveLength(3);

    // Each variation should have required fields
    result.variations.forEach((variation, index) => {
      expect(variation).toHaveProperty("approach");
      expect(variation).toHaveProperty("content");
      expect(variation).toHaveProperty("description");
      
      // Content should be non-empty string
      expect(typeof variation.content).toBe("string");
      expect(variation.content.length).toBeGreaterThan(0);
      
      // Description should be non-empty string
      expect(typeof variation.description).toBe("string");
      expect(variation.description.length).toBeGreaterThan(0);
    });

    // Approaches should be distinct
    const approaches = result.variations.map(v => v.approach);
    expect(new Set(approaches).size).toBe(3); // All unique
  });

  it("should strip markdown formatting from variation content", async () => {
    const caller = appRouter.createCaller({
      user: testUser,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.manuscript.generateRewriteVariations({
      manuscriptId: testManuscriptId,
    });

    // Check that no markdown symbols appear in content
    result.variations.forEach((variation) => {
      // Should not contain header markers
      expect(variation.content).not.toMatch(/^#{1,6}\s+/m);
      
      // Should not contain bold markers
      expect(variation.content).not.toContain("**");
      expect(variation.content).not.toContain("__");
      
      // Should not contain italic markers (single * or _)
      // Note: We check for markdown patterns, not natural asterisks in text
      expect(variation.content).not.toMatch(/\*[^*]+\*/);
      expect(variation.content).not.toMatch(/_[^_]+_/);
      
      // Should not contain code markers
      expect(variation.content).not.toContain("`");
      expect(variation.content).not.toContain("```");
      
      // Should not contain strikethrough markers
      expect(variation.content).not.toContain("~~");
    });
  });

  it("should preserve plain text content without markdown", async () => {
    const caller = appRouter.createCaller({
      user: testUser,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.manuscript.generateRewriteVariations({
      manuscriptId: testManuscriptId,
    });

    // Each variation should have readable prose
    result.variations.forEach((variation) => {
      // Should contain letters and spaces (basic prose check)
      expect(variation.content).toMatch(/[a-zA-Z\s]+/);
      
      // Should not be empty after trimming
      expect(variation.content.trim().length).toBeGreaterThan(0);
      
      // Should have reasonable length (at least 20 characters for a variation)
      expect(variation.content.length).toBeGreaterThan(20);
    });
  });

  it("should return different approaches: Conservative, Moderate, Bold", async () => {
    const caller = appRouter.createCaller({
      user: testUser,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.manuscript.generateRewriteVariations({
      manuscriptId: testManuscriptId,
    });

    const approaches = result.variations.map(v => v.approach);
    
    // Should include all three approach types
    expect(approaches).toContain("Conservative");
    expect(approaches).toContain("Moderate");
    expect(approaches).toContain("Bold");
  });

  it("should throw error for non-existent manuscript", async () => {
    const caller = appRouter.createCaller({
      user: testUser,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.manuscript.generateRewriteVariations({
        manuscriptId: 999999, // Non-existent ID
      })
    ).rejects.toThrow();
  });

  it("should throw error for unauthorized access", async () => {
    // Create another user
    const otherOpenId = `other-openid-${Date.now()}`;
    await db.upsertUser({
      name: "Other User",
      email: `other-user-${Date.now()}@example.com`,
      openId: otherOpenId,
    });
    
    const otherUserData = await db.getUserByOpenId(otherOpenId);
    if (!otherUserData) throw new Error("Failed to create other user");
    
    const otherUser: AuthenticatedUser = {
      id: otherUserData.id,
      openId: otherUserData.openId,
      email: otherUserData.email || "other@example.com",
      name: otherUserData.name || "Other User",
      loginMethod: otherUserData.loginMethod || "manus",
      role: otherUserData.role,
      createdAt: otherUserData.createdAt,
      updatedAt: otherUserData.updatedAt,
      lastSignedIn: otherUserData.lastSignedIn || new Date(),
    };

    const caller = appRouter.createCaller({
      user: otherUser,
      req: {} as any,
      res: {} as any,
    });

    // Try to access manuscript belonging to different user
    await expect(
      caller.manuscript.generateRewriteVariations({
        manuscriptId: testManuscriptId,
      })
    ).rejects.toThrow();
  });

  it("should handle special characters in original content", async () => {
    // Create manuscript with special characters
    const specialManuscript = await db.createManuscriptSection({
      blueprintId: testBlueprintId,
      sectionType: "chapter",
      sectionNumber: 2,
      title: "Chapter 2: Special Characters",
      content: "Content with quotes \"like this\" and apostrophes like it's working!",
      wordCount: 10,
      status: "approved",
    });

    const caller = appRouter.createCaller({
      user: testUser,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.manuscript.generateRewriteVariations({
      manuscriptId: specialManuscript.id,
    });

    // Should successfully generate variations
    expect(result.variations).toHaveLength(3);
    
    // Variations should contain readable content
    result.variations.forEach((variation) => {
      expect(variation.content.length).toBeGreaterThan(0);
    });
  });
});
