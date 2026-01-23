/**
 * Utility functions for processing markdown content
 */

/**
 * Fixes malformed markdown tables by detecting tables and adding missing header separator rows.
 * 
 * Detects patterns like:
 * | Header 1 | Header 2 |
 * | Data 1 | Data 2 |
 * 
 * And converts to:
 * | Header 1 | Header 2 |
 * |----------|----------|
 * | Data 1 | Data 2 |
 * 
 * @param content - Raw markdown content that may contain malformed tables
 * @returns Fixed markdown content with proper table syntax
 */
export function fixMarkdownTables(content: string): string {
  if (!content) return content;

  const lines = content.split('\n');
  const result: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
    
    // Check if current line looks like a table header (starts and ends with |, has at least 2 columns)
    const isTableHeader = currentLine.startsWith('|') && currentLine.endsWith('|') && 
                         (currentLine.match(/\|/g) || []).length >= 3;
    
    // Check if next line is a separator row (contains only |, -, and :)
    const isSeparatorRow = /^\|[\s\-:|]+\|$/.test(nextLine);
    
    // Check if next line is a data row (also starts/ends with |)
    const isDataRow = nextLine.startsWith('|') && nextLine.endsWith('|') && 
                     !/^[\s\-:|]+$/.test(nextLine.replace(/\|/g, ''));
    
    result.push(lines[i]);
    
    // If we have a table header followed by a data row (no separator), insert separator
    if (isTableHeader && !isSeparatorRow && isDataRow) {
      // Count columns in header
      const columnCount = (currentLine.match(/\|/g) || []).length - 1;
      
      // Generate separator row with appropriate number of columns
      const separator = '|' + Array(columnCount).fill('---').join('|') + '|';
      result.push(separator);
    }
  }
  
  return result.join('\n');
}

/**
 * Sanitizes markdown content for safe HTML rendering
 * @param content - Raw markdown content
 * @returns Sanitized markdown content
 */
export function sanitizeMarkdown(content: string): string {
  if (!content) return '';
  
  // Fix tables first
  let sanitized = fixMarkdownTables(content);
  
  // Additional sanitization can be added here if needed
  
  return sanitized;
}
