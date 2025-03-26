/**
 * Options for markdown conversion
 */
export interface MarkdownConverterOptions {
  /** Whether to keep links in the markdown output */
  keepLinks?: boolean;
  /** Whether to keep images in the markdown output */
  keepImages?: boolean;
  /** Whether to keep tables in the markdown output */
  keepTables?: boolean;
  /** Whether to keep code blocks in the markdown output */
  keepCodeBlocks?: boolean;
  /** Custom elements to remove before conversion */
  removeElements?: string[];
}

/**
 * Metadata extracted from a page
 */
export interface PageMetadata {
  url: string;
  description?: string;
} 