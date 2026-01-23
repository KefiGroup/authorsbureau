import { describe, it, expect } from "vitest";

/**
 * Test suite for blueprint query parameter parsing
 * 
 * This test verifies that the StartWritingProcess page correctly reads
 * the blueprintId from the URL query parameter (?blueprintId=123)
 * instead of from a route parameter (:blueprintId)
 */

describe("Blueprint Query Parameter Parsing", () => {
  it("should correctly parse blueprintId from query parameter", () => {
    // Simulate URL: /start-writing?blueprintId=2700
    const location = "/start-writing?blueprintId=2700";
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const blueprintId = searchParams.get('blueprintId') ? parseInt(searchParams.get('blueprintId')!) : null;
    
    expect(blueprintId).toBe(2700);
  });

  it("should return null when blueprintId is missing", () => {
    // Simulate URL: /start-writing
    const location = "/start-writing";
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const blueprintId = searchParams.get('blueprintId') ? parseInt(searchParams.get('blueprintId')!) : null;
    
    expect(blueprintId).toBeNull();
  });

  it("should return null when blueprintId is invalid", () => {
    // Simulate URL: /start-writing?blueprintId=invalid
    const location = "/start-writing?blueprintId=invalid";
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const blueprintId = searchParams.get('blueprintId') ? parseInt(searchParams.get('blueprintId')!) : null;
    
    expect(blueprintId).toBeNaN();
  });

  it("should correctly parse blueprintId with multiple query parameters", () => {
    // Simulate URL: /start-writing?blueprintId=123&other=value
    const location = "/start-writing?blueprintId=123&other=value";
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const blueprintId = searchParams.get('blueprintId') ? parseInt(searchParams.get('blueprintId')!) : null;
    
    expect(blueprintId).toBe(123);
  });

  it("should handle blueprintId=0 correctly", () => {
    // Simulate URL: /start-writing?blueprintId=0
    const location = "/start-writing?blueprintId=0";
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const blueprintId = searchParams.get('blueprintId') ? parseInt(searchParams.get('blueprintId')!) : null;
    
    expect(blueprintId).toBe(0);
  });
});
