import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { JSDOM } from "jsdom";
import { CrawlerResult } from "../../types/crawler";
import { MarkdownConverterOptions, PageMetadata } from "../../types/markdown";

export class MarkdownConverter {
  private turndownService: TurndownService;

  constructor(private options: MarkdownConverterOptions = {}) {
    this.turndownService = new TurndownService({
      headingStyle: "atx",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
      strongDelimiter: "**",
    });

    // Add GitHub Flavored Markdown support
    this.turndownService.use(gfm);

    // Configure rules
    this.configure();
  }

  private configure(): void {
    // Handle links - ignore internal anchors
    this.turndownService.addRule("links", {
      filter: "a",
      replacement: (content, node) => {
        const element = node as HTMLAnchorElement;
        const href = element.getAttribute("href");

        // Ignore internal anchors or empty links
        if (!href || href.startsWith("#")) {
          return content;
        }

        return `[${content}](${href})`;
      },
    });

    // Ensure proper heading spacing
    this.turndownService.addRule("headings", {
      filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
      replacement: (content, node) => {
        const element = node as HTMLElement;
        const level = parseInt(element.tagName[1]);
        return `\n\n${"#".repeat(level)} ${content}\n\n`;
      },
    });
  }

  private cleanupHtml(dom: JSDOM): void {
    const doc = dom.window.document;

    // Define elements to remove
    const elementsToRemove = [
      // Navigation and structure elements
      "nav",
      "header",
      "footer",
      "aside",
      "menu",

      // Interactive elements
      "script",
      "style",
      "iframe",
      "noscript",
      "form",
      "button",
      "input",

      // Optional elements based on configuration
      ...(this.options.keepImages ? [] : ["img"]),
      ...(this.options.keepTables ? [] : ["table"]),
      ...(this.options.keepCodeBlocks ? [] : ["pre", "code"]),
      ...(this.options.removeElements || []),
    ];

    // Remove unwanted elements
    elementsToRemove.forEach((selector) => {
      doc.querySelectorAll(selector).forEach((el) => el.remove());
    });

    // Clean up meaningless elements
    const cleanup = (element: Element) => {
      // Skip if element has been removed
      if (!element.isConnected) return;

      const content = element.textContent?.trim() || "";

      // Remove elements with meaningless content
      if (
        element instanceof dom.window.HTMLElement &&
        (element.tagName === "SPAN" || element.tagName === "DIV")
      ) {
        // Remove if empty or just whitespace
        if (!content) {
          element.remove();
          return;
        }

        // Remove if it's just a single number
        if (/^\d+(\.\d+)?$/.test(content)) {
          element.remove();
          return;
        }

        // Remove if it's just a single character
        if (content.length === 1 && !/[a-zA-Z]/.test(content)) {
          element.remove();
          return;
        }

        // Remove if it's just punctuation
        if (/^[.,\/#!$%\^&\*;:{}=\-_`~()]+$/.test(content)) {
          element.remove();
          return;
        }
      }

      // Clean up children recursively
      Array.from(element.children).forEach(cleanup);
    };

    cleanup(doc.body);
  }

  private extractMetadata(dom: JSDOM, url: string): PageMetadata {
    const doc = dom.window.document;

    // Try different meta selectors for description
    const descriptionSelectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[property="twitter:description"]',
      'meta[itemprop="description"]',
    ];

    let description: string | undefined;

    // Try each selector until we find a description
    for (const selector of descriptionSelectors) {
      const meta = doc.querySelector(selector);
      const content = meta?.getAttribute("content");
      if (content?.trim()) {
        description = content;
        break;
      }
    }

    // If no description found, try to get it from the first paragraph
    if (!description) {
      const firstP = doc.querySelector("p");
      const pContent = firstP?.textContent;
      if (pContent?.trim()) {
        description = pContent;
      }
    }

    return {
      url,
      description: description?.trim(),
    };
  }

  public convert({ content, url, title }: CrawlerResult): string {
    const dom = new JSDOM(content);

    // Clean up the HTML before conversion
    this.cleanupHtml(dom);

    const metadata = this.extractMetadata(dom, url);

    // Convert the entire body to markdown
    const markdown = this.turndownService.turndown(dom.window.document.body);

    // Clean up the markdown
    const cleanedMarkdown = markdown
      // Remove excessive blank lines
      .replace(/\n{3,}/g, "\n\n")
      // Remove trailing spaces
      .replace(/[ \t]+$/gm, "")
      // Remove spaces before newlines
      .replace(/[ \t]+\n/g, "\n")
      // Ensure consistent list formatting
      .replace(/^[-*]\s+/gm, "- ")
      // Clean up multiple spaces
      .replace(/[ \t]+/g, " ")
      // Remove single numbers on their own line
      .replace(/^\d+$/gm, "")
      // Remove lines with just punctuation
      .replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()]+$/gm, "")
      // Remove empty lines after cleaning
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Create frontmatter
    const frontmatter = [
      "---",
      `title: "${title}"`,
      `url: "${url}"`,
      metadata.description &&
        `description: "${metadata.description.replace(/"/g, '\\"')}"`,
      "---",
      "",
    ]
      .filter(Boolean)
      .join("\n");

    return [frontmatter, cleanedMarkdown].join("\n");
  }
}
