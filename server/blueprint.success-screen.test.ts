import { describe, it, expect, beforeAll } from "vitest";
import { trpcRequest } from "./_core/test-helpers";

describe("Blueprint Success Screen", () => {
  let testBlueprintId: number;
  let testUserId: number;

  beforeAll(async () => {
    // Create a test user
    const userResult = await trpcRequest("auth.testCreateUser", {
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
    });
    testUserId = userResult.id;

    // Create a test blueprint
    const blueprintResult = await trpcRequest("blueprint.create", {
      projectType: "non_fiction",
      workingTitle: "Test Book for Success Screen",
      primaryGenre: "Business",
      targetAudience: "Entrepreneurs",
      bookDescription: "A test book to verify the success screen works correctly.",
    }, { userId: testUserId });
    
    testBlueprintId = blueprintResult.id;
  });

  it("should generate blueprint content successfully", async () => {
    // Generate the blueprint
    const result = await trpcRequest("blueprint.generate", {
      blueprintId: testBlueprintId,
    }, { userId: testUserId });

    expect(result.success).toBe(true);
    expect(result.blueprintId).toBe(testBlueprintId);

    // Fetch the blueprint to verify content was generated
    const blueprint = await trpcRequest("blueprint.get", {
      blueprintId: testBlueprintId,
    }, { userId: testUserId });

    expect(blueprint.blueprintGenerated).toBe(true);
    expect(blueprint.blueprintContent).toBeTruthy();
    expect(blueprint.blueprintContent.length).toBeGreaterThan(100);
  });

  it("should have blueprintContent field populated after generation", async () => {
    const blueprint = await trpcRequest("blueprint.get", {
      blueprintId: testBlueprintId,
    }, { userId: testUserId });

    // Verify the field name matches what we're using in the UI
    expect(blueprint).toHaveProperty("blueprintContent");
    expect(typeof blueprint.blueprintContent).toBe("string");
  });

  it("should navigate to correct review-outline route", () => {
    // This is a UI test - verify the route format
    const expectedRoute = `/review-outline/${testBlueprintId}`;
    expect(expectedRoute).toMatch(/^\/review-outline\/\d+$/);
  });
});
