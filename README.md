# MailBot v0.2.0

A bot that processes leads and generates customized responses based on web content analysis.

## Project Structure

```
src/
├── index.ts              # Main entry point
├── types/               # Type definitions
│   ├── markdown.ts      # Markdown converter interfaces
│   └── storage.ts       # File storage interfaces
├── services/
│   ├── web/
│   │   ├── crawler.ts   # Web crawler implementation
│   │   └── markdown-converter.ts # HTML to Markdown converter
│   └── storage/
│       └── file-storage.ts # File storage service
```

## Features

### Web Crawler (Completed)
- Crawls websites starting from a given URL
- Follows links within the same domain
- Configurable depth and page limits
- Filters out unwanted content and patterns
- Handles concurrent requests efficiently

### Markdown Conversion (Completed)
- Converts HTML pages to well-structured Markdown
- Removes unnecessary elements (headers, footers, forms)
- Preserves important content (text, tables, code blocks)
- Adds metadata in frontmatter format
- Organizes content for better readability

### File Storage (Completed)
- Organizes content by project
- Sanitizes filenames
- Stores Markdown pages and link data
- Creates necessary directory structure
- Handles file operations safely

### Content Processing (In Progress)
- Chunk content into meaningful segments
- Generate embeddings for semantic search
- Store processed data for quick retrieval

### Lead Processing (Planned)
- Extract and analyze lead information
- Match lead content with relevant stored data
- Research company information
- Generate customized responses

## Usage

```typescript
import { WebCrawler } from './services/web/crawler';
import { MarkdownConverter } from './services/web/markdown-converter';
import { FileStorage } from './services/storage/file-storage';

async function main() {
  // Initialize services
  const crawler = new WebCrawler({
    maxDepth: 3,
    maxPages: 100,
    concurrent: 5,
    timeout: 30000,
    // ... other options
  });

  const converter = new MarkdownConverter({
    keepLinks: true,
    keepImages: false,
    keepTables: true,
    keepCodeBlocks: true,
  });

  const storage = new FileStorage({
    projectName: 'example-project',
  });

  // Process a website
  const url = 'https://example.com';
  const pages = await crawler.crawl(url);
  
  for (const page of pages) {
    const markdown = await converter.convert(page.html);
    await storage.saveMarkdownFile(page.title, markdown);
  }

  // Save link data
  await storage.saveJsonFile('links.json', crawler.getLinks());
}
```

## Generated Data Structure

```
data/
└── project-name/
    ├── pages/
    │   ├── page-1.md
    │   ├── page-2.md
    │   └── ...
    └── links.json
```

## Configuration Options

### WebCrawler
- `maxDepth`: Maximum depth to crawl (default: 3)
- `maxPages`: Maximum pages to process (default: 100)
- `concurrent`: Number of concurrent requests (default: 5)
- `timeout`: Request timeout in ms (default: 30000)
- `excludePatterns`: URLs to exclude (array of regex)
- `removeElements`: HTML elements to remove
- `ignoreExtensions`: File extensions to ignore
- `ignoreFragments`: Whether to ignore URL fragments

### MarkdownConverter
- `keepLinks`: Preserve hyperlinks
- `keepImages`: Keep image references
- `keepTables`: Preserve table structure
- `keepCodeBlocks`: Maintain code blocks
- `removeElements`: Additional elements to remove

### FileStorage
- `baseDir`: Base directory for data (optional)
- `projectName`: Name of the project (required)

## Next Steps

1. Implement content chunking and embeddings generation
2. Develop lead processing and analysis
3. Add response generation with LLM integration
4. Set up logging and monitoring
5. Add comprehensive test coverage

## License

MIT License - See LICENSE file for details
