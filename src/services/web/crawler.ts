import { 
  CrawlerOptions, 
  CrawlerResult, 
  PageContent,
  DEFAULT_IGNORE_EXTENSIONS,
  DEFAULT_REMOVE_ELEMENTS,
  DEFAULT_EXCLUDE_PATTERNS
} from '../../types/crawler';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';

/**
 * WebCrawler class for crawling web pages within a specific domain
 */
export class WebCrawler {
  private visited = new Set<string>();
  private queue: { url: string; depth: number }[] = [];
  private results: CrawlerResult[] = [];
  private domain: string;
  private options: Required<CrawlerOptions>;

  /**
   * Creates a new WebCrawler instance
   * 
   * @param baseUrl - The starting URL for crawling
   * @param options - Configuration options for the crawler
   * @throws {Error} If baseUrl is not a valid URL
   */
  constructor(private baseUrl: string, options: CrawlerOptions = {}) {
    this.domain = new URL(baseUrl).hostname;
    this.options = {
      maxDepth: options.maxDepth ?? 3,
      maxPages: options.maxPages ?? 100,
      excludePatterns: [...(options.excludePatterns ?? []), ...DEFAULT_EXCLUDE_PATTERNS],
      includePatterns: options.includePatterns ?? [],
      timeout: options.timeout ?? 30000,
      concurrent: options.concurrent ?? 5,
      removeElements: [...(options.removeElements ?? []), ...DEFAULT_REMOVE_ELEMENTS],
      ignoreFragments: options.ignoreFragments ?? true,
      ignoreExtensions: [...(options.ignoreExtensions ?? []), ...DEFAULT_IGNORE_EXTENSIONS],
    };
  }

  /**
   * Normalizes a URL by resolving it against the base URL and removing trailing slashes and fragments
   * 
   * @param url - The URL to normalize
   * @returns The normalized URL or an empty string if invalid
   */
  private normalizeUrl(url: string): string {
    try {
      // Remove fragments if configured
      const urlWithoutFragment = this.options.ignoreFragments 
        ? url.split('#')[0] 
        : url;

      if (!urlWithoutFragment) return '';

      let parsed: URL;
      try {
        parsed = new URL(urlWithoutFragment);
      } catch {
        parsed = new URL(urlWithoutFragment, this.baseUrl);
      }

      // Remove trailing slash
      return parsed.href.replace(/\/$/, '');
    } catch {
      return '';
    }
  }

  /**
   * Checks if a URL is valid for crawling based on domain and patterns
   * 
   * @param url - The URL to validate
   * @returns True if the URL is valid for crawling
   */
  private isValidUrl(url: string): boolean {
    if (!url) return false;
    
    try {
      const parsed = new URL(url);
      if (parsed.hostname !== this.domain) return false;
      
      const path = parsed.pathname.toLowerCase();
      
      // Check file extensions
      if (this.options.ignoreExtensions.some(ext => 
        path.endsWith(ext.toLowerCase())
      )) return false;
      
      // Check exclude patterns
      if (this.options.excludePatterns.some(pattern => 
        path.includes(pattern.toLowerCase())
      )) return false;
      
      // Check include patterns
      if (this.options.includePatterns.length > 0 &&
          !this.options.includePatterns.some(pattern =>
            path.includes(pattern.toLowerCase())
          )) return false;
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetches and processes a single page
   * 
   * @param url - The URL to fetch
   * @returns Processed page content
   * @throws {Error} If the fetch fails or times out
   */
  private async fetchPage(url: string): Promise<PageContent> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const html = await response.text();
      
      const $ = cheerio.load(html);
      
      // Remove configured elements
      this.options.removeElements.forEach(selector => {
        $(selector).remove();
      });
      
      const title = $('title').text().trim() || url;
      const content = $('body').text().trim();
      
      const links = new Set<string>();
      $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          const normalizedUrl = this.normalizeUrl(href);
          if (this.isValidUrl(normalizedUrl)) {
            links.add(normalizedUrl);
          }
        }
      });

      return {
        title,
        content,
        links: Array.from(links),
      };
    } catch (error) {
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Starts the crawling process from the base URL
   * 
   * @returns Array of crawl results for each processed page
   * @throws {Error} If the base URL is invalid or network errors occur
   */
  public async crawl(): Promise<CrawlerResult[]> {
    this.queue = [{ url: this.baseUrl, depth: 0 }];
    this.visited.clear();
    this.results = [];

    const limit = pLimit(this.options.concurrent);
    
    while (this.queue.length > 0 && this.results.length < this.options.maxPages) {
      const batch = this.queue.splice(0, this.options.concurrent);
      
      const promises = batch.map(({ url, depth }) =>
        limit(async () => {
          if (this.visited.has(url)) return;
          this.visited.add(url);

          try {
            const { title, content, links } = await this.fetchPage(url);
            
            this.results.push({
              url,
              title,
              content,
              links,
              depth,
            });

            if (depth < this.options.maxDepth) {
              links.forEach(link => {
                if (!this.visited.has(link)) {
                  this.queue.push({ url: link, depth: depth + 1 });
                }
              });
            }
          } catch (error) {
            console.error(`Error crawling ${url}:`, error);
            this.results.push({
              url,
              title: url,
              content: '',
              links: [],
              depth,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        })
      );

      await Promise.all(promises);
    }

    return this.results;
  }
} 