import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { FileStorage } from "../../../src/services/storage/file-storage";
import { removeDir } from "../../setup";
import { readdir } from "fs/promises";

describe("FileStorage", async () => {
  let storage: FileStorage;
  const projectName = "test-project";
  let tempDir: string = `data/projects/${projectName}`;
  await removeDir(tempDir);

  beforeEach(async () => {
    storage = new FileStorage({
      baseDir: "data",
      projectName,
    });
  });

  test("constructor initializes with default options", () => {
    const defaultStorage = new FileStorage({ projectName: "test" });
    expect(defaultStorage).toBeDefined();
  });

  test("initializes project directories", async () => {
    await storage.init();

    const projectDirExists = await readdir(tempDir);
    const pagesDirExists = await readdir(tempDir + "/pages");

    expect(projectDirExists).toEqual(["pages"]);
    expect(pagesDirExists).toEqual([]);
  });

  test("sanitizes filenames correctly", async () => {
    await storage.init();

    const unsafeTitle = "Test: File/with\\invalid*chars?and|symbols<>";
    const filepath = await storage.saveMarkdownFile(
      unsafeTitle,
      "# Test content"
    );

    expect(filepath).not.toContain(":");
    expect(filepath).not.toContain("?");
    expect(filepath).not.toContain("*");
    expect(filepath).not.toContain("|");
    expect(filepath).not.toContain("<");
    expect(filepath).not.toContain(">");
    expect(filepath).toContain(
      tempDir + "/pages/Test- File-with-invalid-chars-and-symbols.md"
    );
  });

  // test("saves markdown files correctly", async () => {
  //   await storage.init();

  //   const content = "# Test Markdown\nThis is a test.";
  //   const filepath = await storage.saveMarkdownFile("test", content);

  //   const file = Bun.file(filepath);
  //   const exists = await file.exists();
  //   const savedContent = await file.text();

  //   expect(exists).toBe(true);
  //   expect(savedContent).toBe(content);
  // });

  test("saves JSON files correctly", async () => {
    await storage.init();

    const data = { test: "data", number: 123 };
    const filepath = await storage.saveJsonFile("test", data);

    const file = Bun.file(filepath);
    const exists = await file.exists();
    const savedContent = await file.json();

    expect(exists).toBe(true);
        expect(savedContent).toEqual(data);

  });

  test("handles concurrent file operations", async () => {
    await storage.init();

    const operations = Array.from({ length: 5 }, (_, i) => ({
      title: `file-${i}`,
      content: `Content ${i}`
    }));

    const results = await Promise.all(
      operations.map(({ title, content }) =>
        storage.saveMarkdownFile(title, content)
      )
    );

    const fileContents = await Promise.all(
      results.map(filepath => Bun.file(filepath).text())
    );

    operations.forEach(({ content }, i) => {
      expect(fileContents[i]).toBe(content);
    });
  });
});
