import { describe, expect, test, mock } from "bun:test";
import { WebCrawler } from "../../../src/services/web/crawler";
import { createMockHtml, mockFetch } from "../../setup";
import * as cheerio from 'cheerio';

describe("WebCrawler", () => {
  const baseUrl = "https://example.com";
  const mockHtml = createMockHtml({
    title: "Test Page",
    content: "<h1>Test</h1><p>This is a test.</p>",
    links: [
      `${baseUrl}/about`,
      `${baseUrl}/contact`,
      "https://other-domain.com"
    ]
  });

  const mockAboutHtml = createMockHtml({
    title: "About Page",
    content: "<h1>About</h1><p>About page content.</p>",
    links: [
      baseUrl,
      `${baseUrl}/contact`
    ]
  });

  const mockContactHtml = createMockHtml({
    title: "Contact Page",
    content: "<h1>Contact</h1><p>Contact page content.</p>",
    links: [
      baseUrl,
      `${baseUrl}/about`
    ]
  });

  test("constructor initializes with default options", () => {
    const crawler = new WebCrawler(baseUrl);
    expect(crawler).toBeDefined();
  });

  test("crawls pages within same domain", async () => {
    const fetch = mock((url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr === baseUrl) {
        return Promise.resolve(new Response(mockHtml));
      }
      if (urlStr === `${baseUrl}/about`) {
        return Promise.resolve(new Response(mockAboutHtml));
      }
      if (urlStr === `${baseUrl}/contact`) {
        return Promise.resolve(new Response(mockContactHtml));
      }
      return Promise.reject(new Error(`404: ${urlStr} not found`));
    });

    global.fetch = fetch;
    const crawler = new WebCrawler(baseUrl, { 
      maxDepth: 1,
      maxPages: 10,
      concurrent: 1
    });
    
    const results = await crawler.crawl();
    
    expect(results.length).toBe(3);
    expect(results[0].url).toBe(baseUrl);
    expect(results[0].title).toBe("Test Page");
    expect(results[0].content).toContain("<h1>Test</h1>");
    expect(results[1].url).toBe(`${baseUrl}/about`);
    expect(results[1].title).toBe("About Page");
  });

  test("respects maxDepth option", async () => {
    const fetch = mock((url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr === baseUrl) {
        return Promise.resolve(new Response(mockHtml));
      }
      return Promise.reject(new Error(`404: ${urlStr} not found`));
    });

    global.fetch = fetch;
    const crawler = new WebCrawler(baseUrl, { maxDepth: 0 });
    
    const results = await crawler.crawl();
    
    expect(results.length).toBe(1);
    expect(results[0].url).toBe(baseUrl);
  });

  test("respects maxPages option", async () => {
    const fetch = mock((url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr === baseUrl) {
        return Promise.resolve(new Response(mockHtml));
      }
      if (urlStr === `${baseUrl}/about`) {
        return Promise.resolve(new Response(mockAboutHtml));
      }
      return Promise.reject(new Error(`404: ${urlStr} not found`));
    });

    global.fetch = fetch;
    const crawler = new WebCrawler(baseUrl, { maxPages: 1 });
    
    const results = await crawler.crawl();
    
    expect(results.length).toBe(1);
    expect(results[0].url).toBe(baseUrl);
  });

  test("excludes URLs matching patterns", async () => {
    const fetch = mock((url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr === baseUrl) {
        return Promise.resolve(new Response(mockHtml));
      }
      return Promise.reject(new Error(`404: ${urlStr} not found`));
    });

    global.fetch = fetch;
    const crawler = new WebCrawler(baseUrl, {
      excludePatterns: ["/about", "/contact"]
    });
    
    const results = await crawler.crawl();
    
    expect(results.length).toBe(1);
    expect(results[0].url).toBe(baseUrl);
  });

  test("removes specified HTML elements", async () => {
    const htmlWithElements = createMockHtml({
      title: "Elements Test",
      content: `
        <header>Header content</header>
        <main>Main content</main>
        <footer>Footer content</footer>
      `
    });

    const fetch = mock((url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr === baseUrl) {
        return Promise.resolve(new Response(htmlWithElements));
      }
      return Promise.reject(new Error(`404: ${urlStr} not found`));
    });

    global.fetch = fetch;
    const crawler = new WebCrawler(baseUrl, {
      removeElements: ["header", "footer"],
      maxDepth: 0,
      removeElement: true
    });
    
    const results = await crawler.crawl();
    
    const $ = cheerio.load(results[0].content);
    expect($("header").length).toBe(0);
    expect($("footer").length).toBe(0);
    expect($("main").length).toBe(1);
  });

  test("handles network errors gracefully", async () => {
    global.fetch = mock(() => Promise.reject(new Error("Network error")));
    const crawler = new WebCrawler(baseUrl);
    
    const results = await crawler.crawl();
    
    expect(results.length).toBe(1);
    expect(results[0].error).toBe("Network error");
  });

  test("handles invalid HTML gracefully", async () => {
    global.fetch = mock(() => Promise.resolve(new Response("not html")));
    const crawler = new WebCrawler(baseUrl);
    
    const results = await crawler.crawl();
    
    expect(results.length).toBe(1);
    expect(results[0].content).toBe("not html");
  });

  test("performs concurrent requests", async () => {
    const urls = Array.from({ length: 5 }, (_, i) => `${baseUrl}/page${i}`);
    const htmlPages = urls.map(url => createMockHtml({
      title: `Page ${url}`,
      content: `<h1>Content for ${url}</h1>`,
      links: urls.filter(u => u !== url)
    }));

    let requestCount = 0;
    global.fetch = mock((url: string | URL | Request) => {
      requestCount++;
      const urlStr = url.toString();
      if (urlStr === urls[0]) {
        return Promise.resolve(new Response(htmlPages[0]));
      }
      return Promise.reject(new Error(`404: ${urlStr} not found`));
    });

    const crawler = new WebCrawler(urls[0], {
      concurrent: 2,
      maxDepth: 0
    });

    const results = await crawler.crawl();

    expect(results.length).toBe(1);
    expect(requestCount).toBe(1);
  });
}); 