import { CrawlerResult } from "../src/types/crawler";
import { mkdir } from "node:fs/promises";

/**
 * Creates mock HTML content for testing
 */
export function createMockHtml(options: {
  title?: string;
  description?: string;
  content?: string;
  links?: string[];
} = {}): string {
  const {
    title = "Test Page",
    description = "A test page description",
    content = "<p>Test content</p>",
    links = []
  } = options;

  const linksHtml = links.map(link => `<a href="${link}">Link to ${link}</a>`).join("\n");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta name="description" content="${description}">
      </head>
      <body>
        ${content}
        ${linksHtml}
      </body>
    </html>
  `;
}

/**
 * Creates a mock page result for testing
 */
export function createMockPage(url: string, content: string): CrawlerResult {
  return {
    url,
    title: "Test Page",
    content,
    links: [],
    depth: 0
  };
}

/**
 * Mock fetch function for testing
 */
export function mockFetch(baseUrl: string, mockHtml: string, mockAboutHtml: string): typeof fetch {
  return (url: string | URL | Request) => {
    const urlStr = url.toString();
    if (urlStr === baseUrl) {
      return Promise.resolve(new Response(mockHtml));
    }
    if (urlStr === `${baseUrl}/about`) {
      return Promise.resolve(new Response(mockAboutHtml));
    }
    return Promise.reject(new Error(`404: ${urlStr} not found`));
  };
}

/**
 * Creates a temporary directory for testing
 */
export async function createTempDir(): Promise<string> {
  const tempDir = `data/projects/mailbot-test`;
  await mkdir(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Removes a directory and its contents
 */
export async function removeDir(dir: string): Promise<void> {
  await Bun.spawn(['rm', '-rf', dir]);
} 