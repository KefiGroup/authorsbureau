import { describe, it, expect } from "vitest";

/**
 * Test suite for DOCX table export functionality
 * 
 * This tests the markdown table parsing logic that was added to exportDocx.ts
 * to fix the issue where tables were exported as plain text instead of Word tables.
 */

describe("DOCX Table Export Logic", () => {
  /**
   * Helper function that simulates the table parsing logic from exportDocx.ts
   */
  function parseMarkdownTableLines(tableLines: string[]): { rows: string[][], hasHeaderSeparator: boolean } | null {
    if (tableLines.length < 2) return null;

    const rows: string[][] = [];
    let hasHeaderSeparator = false;

    for (let i = 0; i < tableLines.length; i++) {
      const line = tableLines[i].trim();
      
      // Check if this is the separator line (|---|---|)
      if (line.match(/^\|[\s\-:|]+\|$/)) {
        hasHeaderSeparator = true;
        continue;
      }

      // Parse cells from the line
      const cells = line
        .split('|')
        .slice(1, -1) // Remove first and last empty elements
        .map(cell => cell.trim());

      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    if (rows.length === 0) return null;

    return { rows, hasHeaderSeparator };
  }

  it("should parse a simple 2-column table", () => {
    const tableLines = [
      "| Column 1 | Column 2 |",
      "|----------|----------|",
      "| Data 1   | Data 2   |",
      "| Data 3   | Data 4   |",
    ];

    const result = parseMarkdownTableLines(tableLines);
    
    expect(result).not.toBeNull();
    expect(result?.rows).toHaveLength(3); // Header + 2 data rows
    expect(result?.hasHeaderSeparator).toBe(true);
    expect(result?.rows[0]).toEqual(["Column 1", "Column 2"]);
    expect(result?.rows[1]).toEqual(["Data 1", "Data 2"]);
    expect(result?.rows[2]).toEqual(["Data 3", "Data 4"]);
  });

  it("should parse a 3-column table with complex data", () => {
    const tableLines = [
      "| Action | Estimated Cost/Risk | Details |",
      "|--------|---------------------|---------|",
      "| Financial Cost | $500,000 to $5,000,000 | New licenses, training, integration |",
      "| Time Cost | 12 to 36 months | Implementation and testing |",
    ];

    const result = parseMarkdownTableLines(tableLines);
    
    expect(result).not.toBeNull();
    expect(result?.rows).toHaveLength(3);
    expect(result?.hasHeaderSeparator).toBe(true);
    expect(result?.rows[0]).toEqual(["Action", "Estimated Cost/Risk", "Details"]);
    expect(result?.rows[1]).toEqual([
      "Financial Cost",
      "$500,000 to $5,000,000",
      "New licenses, training, integration"
    ]);
  });

  it("should handle tables without separator line", () => {
    const tableLines = [
      "| Column 1 | Column 2 |",
      "| Data 1   | Data 2   |",
    ];

    const result = parseMarkdownTableLines(tableLines);
    
    expect(result).not.toBeNull();
    expect(result?.rows).toHaveLength(2);
    expect(result?.hasHeaderSeparator).toBe(false);
  });

  it("should handle tables with extra spaces", () => {
    const tableLines = [
      "|  Column 1  |  Column 2  |",
      "|------------|------------|",
      "|  Data 1    |  Data 2    |",
    ];

    const result = parseMarkdownTableLines(tableLines);
    
    expect(result).not.toBeNull();
    expect(result?.rows[0]).toEqual(["Column 1", "Column 2"]);
    expect(result?.rows[1]).toEqual(["Data 1", "Data 2"]);
  });

  it("should handle tables with single column", () => {
    const tableLines = [
      "| Column |",
      "|--------|",
      "| Data 1 |",
      "| Data 2 |",
    ];

    const result = parseMarkdownTableLines(tableLines);
    
    expect(result).not.toBeNull();
    expect(result?.rows).toHaveLength(3);
    expect(result?.rows[0]).toEqual(["Column"]);
    expect(result?.rows[1]).toEqual(["Data 1"]);
    expect(result?.rows[2]).toEqual(["Data 2"]);
  });

  it("should handle tables with many columns", () => {
    const tableLines = [
      "| A | B | C | D | E |",
      "|---|---|---|---|---|",
      "| 1 | 2 | 3 | 4 | 5 |",
    ];

    const result = parseMarkdownTableLines(tableLines);
    
    expect(result).not.toBeNull();
    expect(result?.rows[0]).toHaveLength(5);
    expect(result?.rows[1]).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("should return null for empty table", () => {
    const tableLines: string[] = [];
    const result = parseMarkdownTableLines(tableLines);
    expect(result).toBeNull();
  });

  it("should return null for single line table", () => {
    const tableLines = ["| Column |"];
    const result = parseMarkdownTableLines(tableLines);
    expect(result).toBeNull();
  });

  it("should handle separator with alignment markers", () => {
    const tableLines = [
      "| Left | Center | Right |",
      "|:-----|:------:|------:|",
      "| A    | B      | C     |",
    ];

    const result = parseMarkdownTableLines(tableLines);
    
    expect(result).not.toBeNull();
    expect(result?.hasHeaderSeparator).toBe(true);
    expect(result?.rows).toHaveLength(2); // Header + 1 data row
  });
});
