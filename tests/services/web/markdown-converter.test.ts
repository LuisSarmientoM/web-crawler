import { describe, expect, test } from "bun:test";
import { MarkdownConverter } from "../../../src/services/web/markdown-converter";
import { createMockHtml } from "../../setup";

describe("MarkdownConverter", () => {
  test("converts basic HTML to Markdown", async () => {
    const converter = new MarkdownConverter();
    const html = createMockHtml({
      title: "Test Page",
      description: "A test page description",
      content: "<h1>Hello World</h1><p>This is a test.</p>"
    });

    const result = await converter.convert({
      url: "https://example.com",
      title: "Test Page",
      content: html,
      links: [],
      depth: 0
    });

    expect(result).toContain("---");
    expect(result).toContain('title: "Test Page"');
    expect(result).toContain('description: "A test page description"');
    expect(result).toContain('url: "https://example.com"');
    expect(result).toContain("# Hello World");
    expect(result).toContain("This is a test.");
  });

  test("handles code blocks correctly", async () => {
    const converter = new MarkdownConverter();
    const html = createMockHtml({
      title: "Code Test",
      content: '<pre><code class="language-javascript">const x = 1;</code></pre>'
    });

    const result = await converter.convert({
      url: "https://example.com",
      title: "Code Test",
      content: html,
      links: [],
      depth: 0
    });

    expect(result).not.toContain("```javascript");
    expect(result).not.toContain("const x = 1;");
    expect(result).not.toContain('pre')
  });

  test("handles lists correctly", async () => {
    const converter = new MarkdownConverter();
    const html = createMockHtml({
      title: "List Test",
      content: `
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
        <ol>
          <li>First</li>
          <li>Second</li>
        </ol>
      `
    });

    const result = await converter.convert({
      url: "https://example.com",
      title: "List Test",
      content: html,
      links: [],
      depth: 0
    });

    expect(result).toContain("- Item 1");
    expect(result).toContain("- Item 2");
    expect(result).toContain("1. First");
    expect(result).toContain("2. Second");
  });

  test("removes specified elements", async () => {
    const converter = new MarkdownConverter({
      removeElements: ["nav", ".sidebar"]
    });
    const html = createMockHtml({
      title: "Remove Test",
      content: `
        <nav>Navigation</nav>
        <div class="sidebar">Sidebar</div>
        <main>Main content</main>
      `
    });

    const result = await converter.convert({
      url: "https://example.com",
      title: "Remove Test",
      content: html,
      links: [],
      depth: 0
    });

    expect(result).not.toContain("Navigation");
    expect(result).not.toContain("Sidebar");
    expect(result).toContain("Main content");
  });

  test("handles empty or invalid input", async () => {
    const converter = new MarkdownConverter();
    const result = await converter.convert({
      url: "https://example.com",
      title: "Empty Test",
      content: "",
      links: [],
      depth: 0
    });

    expect(result).toContain("---");
    expect(result).toContain('url: "https://example.com"');
    expect(result).toContain('title: "Empty Test"');
  });

  test("respects keepLinks option", async () => {
    const converter = new MarkdownConverter({ keepLinks: false });
    const html = createMockHtml({
      title: "Links Test",
      content: '<a href="https://example.com">Link text</a>'
    });

    const result = await converter.convert({
      url: "https://example.com",
      title: "Links Test",
      content: html,
      links: [],
      depth: 0
    });

    expect(result).toContain("[Link text](https://example.com)");
    
  });

  test("respects keepLinks option", async () => {
    const converter = new MarkdownConverter({ keepLinks: false });
    const html = createMockHtml({
      title: "Links Test",
      content: '<a href="#some-tag">Link text</a>'
    });

    const result = await converter.convert({
      url: "https://example.com",
      title: "Links Test",
      content: html,
      links: [],
      depth: 0
    });

    expect(result).not.toContain("[");
    expect(result).not.toContain("]");
  });

  test("respects keepImages option", async () => {
    const converter = new MarkdownConverter({ keepImages: false });
    const html = createMockHtml({
      title: "Images Test",
      content: '<img src="test.jpg" alt="Test image">'
    });

    const result = await converter.convert({
      url: "https://example.com",
      title: "Images Test",
      content: html,
      links: [],
      depth: 0
    });

    expect(result).not.toContain("test.jpg");
    expect(result).not.toContain("Test image");
  });

  test("handles nested elements correctly", async () => {
    const converter = new MarkdownConverter();
    const html = createMockHtml({
      title: "Nested Test",
      content: `
        <div>
          <h1>Title</h1>
          <div>
            <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </div>
      `
    });

    const result = await converter.convert({
      url: "https://example.com",
      title: "Nested Test",
      content: html,
      links: [],
      depth: 0
    });

    expect(result).toContain("# Title");
    expect(result).toContain("**bold**");
    expect(result).toContain("_italic_");
    expect(result).toContain("- Item 1");
    expect(result).toContain("- Item 2");
  });

  test("handles headings inside links correctly", () => {
    const converter = new MarkdownConverter();
    const html = `
      <body>
        <a href="https://example.com/page">
          <h2>This is a heading inside a link</h2>
        </a>
        <a href="https://example.com/another">
          <h3>Another heading in a link</h3>
        </a>
        <h2><a href="https://example.com/reverse">Heading with link inside</a></h2>
      </body>
    `;

    const result = converter.convert({
      content: html,
      url: "https://example.com",
      title: "Test Page",
      links: [],
      depth: 0
    });

    expect(result).toContain("## [This is a heading inside a link](https://example.com/page)");
    expect(result).toContain("### [Another heading in a link](https://example.com/another)");
    expect(result).toContain("## [Heading with link inside](https://example.com/reverse)");
    
    // Verify there are no malformed markdown patterns
    expect(result).not.toContain("[\n\n##");
    expect(result).not.toContain("\n\n]\n\n");
  });
}); 