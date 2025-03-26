import { WebCrawler } from "./services/web/crawler";
import { MarkdownConverter } from "./services/web/markdown-converter";
import { FileStorage } from "./services/storage/file-storage";

/**
 * Example implementation of the web crawler and content processor
 */
async function main() {
  const projectName = "tuatara";
  const url = "https://tuatara.co";

  // Initialize services
  const crawler = new WebCrawler(url, {
    maxDepth: 2,
    maxPages: 1,
    excludePatterns: [
      '/api/',
      '/login',
      '/admin',
      '/wp-content',
      '/wp-includes',
      '/wp-admin',
    ],
    ignoreExtensions: [
      '.pdf',
      '.jpg',
      '.png',
      '.gif',
    ],
    timeout: 5000,
  });

  const converter = new MarkdownConverter({
    keepLinks: true,
    keepImages: false,
    keepTables: true,
    keepCodeBlocks: false,
    removeElements: [
      '.sidebar',
      '.widget',
      '.idt-widget',
      '.comments',
      '#idt-contact'
    ]
  });

  const storage = new FileStorage({
    projectName,
    baseDir: 'data'
  });

  // Initialize storage
  await storage.init();

  console.log("Starting crawler...");
  const results = await crawler.crawl();
  
  console.log(`\nCrawled ${results.length} pages:`);
  
  // Process and save each page
  for (const result of results) {
    if (result.error) {
      console.error(`Error processing ${result.url}: ${result.error}`);
      continue;
    }

    console.log(`\nProcessing: ${result.url}`);
    
    try {
      // Convert to markdown with metadata
      const markdown = converter.convert(result);
      
      // Save the markdown file
      const filepath = await storage.saveMarkdownFile(result.title, markdown);
      console.log(`Saved to: ${filepath}`);
    } catch (error) {
      console.error(`Error converting ${result.url}: ${error}`);
    }
  }

  // Save the links data
  const links = results.map(result => ({
    url: result.url,
    title: result.title,
    links: result.links,
    error: result.error
  }));
  
  const linksPath = await storage.saveJsonFile('links', links);
  console.log(`\nSaved links data to: ${linksPath}`);
}

// Handle any unhandled promise rejections
main().catch(console.error);
