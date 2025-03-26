import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FileStorageOptions } from '../../types/storage';

/**
 * Service to handle file storage operations
 */
export class FileStorage {
  private baseDir: string;
  private projectDir: string;
  private pagesDir: string;

  /**
   * Creates a new FileStorage instance
   * 
   * @param options - Configuration options for file storage
   */
  constructor(private options: FileStorageOptions) {
    this.baseDir = options.baseDir ?? 'data';
    this.projectDir = join(this.baseDir, 'projects', options.projectName);
    this.pagesDir = join(this.projectDir, 'pages');
  }

  /**
   * Initializes the storage directories
   * 
   * @returns Promise that resolves when directories are created
   */
  public async init(): Promise<void> {
    await mkdir(this.pagesDir, { recursive: true });
  }

  /**
   * Sanitizes a filename by removing or replacing invalid characters
   * 
   * @param filename - The filename to sanitize
   * @returns Sanitized filename
   */
  private sanitizeFilename(filename: string): string {
    return filename
      // Replace invalid characters with dashes
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
      // Replace multiple dashes with single dash
      .replace(/-+/g, '-')
      // Remove leading/trailing dashes
      .replace(/^-+|-+$/g, '')
      // Limit length and add hash if too long
      .slice(0, 100);
  }

  /**
   * Saves a markdown file
   * 
   * @param title - The title to use for the filename
   * @param content - The markdown content to save
   * @returns Promise that resolves to the saved file path
   */
  public async saveMarkdownFile(title: string, content: string): Promise<string> {
    const filename = this.sanitizeFilename(title) + '.md';
    const filepath = join(this.pagesDir, filename);
    
    await writeFile(filepath, content, 'utf-8');
    return filepath;
  }

  /**
   * Saves JSON data to a file
   * 
   * @param filename - Name of the JSON file (without extension)
   * @param data - Data to save
   * @returns Promise that resolves to the saved file path
   */
  public async saveJsonFile(filename: string, data: unknown): Promise<string> {
    const filepath = join(this.projectDir, `${filename}.json`);
    await writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
    return filepath;
  }
} 