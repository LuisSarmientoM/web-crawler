import { WebCrawler } from "./services/web/crawler";

/**
 * Example implementation of the WebCrawler
 * This script demonstrates how to use the WebCrawler class to crawl a website
 * and process the results
 */
async function main() {
  // Configure the target URL and crawler options
  const url = "https://tuatara.co";

  const crawler = new WebCrawler(url, {
    maxDepth: 2,        // Only crawl 2 levels deep
    maxPages: 10,       // Limit to 10 pages
    excludePatterns: [
      '/api/',
      '/login',
      '/admin',
      '/wp-content',    // WordPress specific patterns
      '/wp-includes',
      '/wp-admin',
    ],
    // Custom elements to remove (in addition to defaults)
    removeElements: [
      'header',
      'footer',
      'nav',
      'aside',
      '.cookie-notice',
      '#popup-modal',
      '.social-share',
    ],
    // Override default ignore extensions
    ignoreExtensions: [
      '.pdf',
      '.jpg',
      '.png',
      '.gif',
    ],
    ignoreFragments: true,  // Ignore URLs with fragments (#)
    concurrent: 3,          // Process 3 pages simultaneously
    timeout: 5000,         // Timeout after 5 seconds
  });

  console.log("Starting crawler...");
  const results = await crawler.crawl();

  // Process and display results
  console.log(`Crawled ${results.length} pages:`);
  results.forEach((result, index) => {
    console.log(`\n[${index + 1}] ${result.url}`);
    console.log(`Title: ${result.title}`);
    console.log(`Content length: ${result.content.length} characters`);
    console.log(`Found ${result.links.length} links`);
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
  });
}

// Handle any unhandled promise rejections
main().catch(console.error);
