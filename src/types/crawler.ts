/**
 * File extensions that should be ignored during crawling
 */
export type IgnoreExtension = 
  | '.css' | '.js' | '.txt' | '.ttf' | '.woff'
  | '.png' | '.jpg' | '.jpeg' | '.svg' | '.pdf'
  | '.zip' | '.mp3' | '.mp4' | '.webm' | '.xml'
  | '.json' | '.docx' | '.xlsx' | '.pptx'
  | '.doc' | '.xls' | '.ppt' | '.html';

/**
 * HTML elements that should be removed from content
 */
export type RemoveElement = 
  | 'script' | 'style' | 'noscript' | 'iframe'
  | 'img' | 'svg' | 'video' | 'audio' | 'form'
  | 'header' | 'footer' | 'nav' | 'aside';

/**
 * URL patterns that should be excluded from crawling
 */
export type ExcludePattern = 
  | '/wp-content/' | '/wp-includes/' | '/wp-admin/'
  | '/wp-json' | 'mailto:' | 'tel:' | 'javascript:'
  | '#' | '/feed' | '.php' | '/page';

/**
 * Default extensions to ignore during crawling
 */
export const DEFAULT_IGNORE_EXTENSIONS: IgnoreExtension[] = [
  '.css', '.js', '.txt', '.ttf', '.woff', '.png', '.jpg',
  '.jpeg', '.svg', '.pdf', '.zip', '.mp3', '.mp4', '.webm',
  '.xml', '.json', '.docx', '.xlsx', '.pptx', '.doc',
  '.xls', '.ppt', '.html'
];

/**
 * Default elements to remove from content
 */
export const DEFAULT_REMOVE_ELEMENTS: RemoveElement[] = [
  'script', 'style', 'noscript', 'iframe', 'img',
  'svg', 'video', 'audio', 'form'
];

/**
 * Default URL patterns to exclude
 */
export const DEFAULT_EXCLUDE_PATTERNS: ExcludePattern[] = [
  '/wp-content/', '/wp-includes/', '/wp-admin/', '/wp-json',
  'mailto:', 'tel:', 'javascript:', '#', '/feed',
  '.php', '/page'
];

/**
 * Configuration options for the web crawler
 */
export interface CrawlerOptions {
  /** Maximum depth level for crawling. Default is 3 */
  maxDepth?: number;
  /** Maximum number of pages to crawl. Default is 100 */
  maxPages?: number;
  /** URL patterns to exclude from crawling (e.g., ['/admin', '/login']) */
  excludePatterns?: (ExcludePattern | string)[];
  /** URL patterns to include in crawling. If empty, all valid URLs are included */
  includePatterns?: string[];
  /** Timeout in milliseconds for each request. Default is 30000 */
  timeout?: number;
  /** Number of concurrent requests. Default is 5 */
  concurrent?: number;
  /** HTML elements to remove from content. Default includes common non-content elements */
  removeElements?: (RemoveElement | string)[];
  /** Whether to ignore URL fragments (everything after #). Default is true */
  ignoreFragments?: boolean;
  /** File extensions to ignore. Default includes common non-html extensions */
  ignoreExtensions?: (IgnoreExtension | string)[];
}

/**
 * Result object for each crawled page
 */
export interface CrawlerResult {
  /** The URL of the crawled page */
  url: string;
  /** The extracted text content of the page */
  content: string;
  /** The page title */
  title: string;
  /** List of discovered URLs on the page */
  links: string[];
  /** The depth level at which this page was found */
  depth: number;
  /** Error message if the page crawl failed */
  error?: string;
}

/**
 * Represents the extracted content from a single page
 */
export interface PageContent {
  /** The page title */
  title: string;
  /** The main content of the page */
  content: string;
  /** List of discovered URLs on the page */
  links: string[];
} 