import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import * as crypto from "crypto";

export interface FileUploadResult {
  filename: string;
  path: string;
  url: string;
}

export class FileStorageUtil {
  private static readonly UPLOAD_DIR: string = join(process.cwd(), "uploads", "transactions");
  private static readonly MAX_FILE_SIZE: number = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_MIME_TYPES: string[] = [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  static getUploadDirectory(): string {
    return this.UPLOAD_DIR;
  }

  static ensureUploadDirectory(): void {
    if (!existsSync(this.UPLOAD_DIR)) {
      mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }
  }

  static validateFile(file: { mimetype: string; size: number }): void {
    if (!file) {
      throw new Error("No file provided");
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error(
        `File type "${file.mimetype}" is not allowed. Allowed types: ${this.ALLOWED_MIME_TYPES.join(", ")}`
      );
    }
  }

  static generateFilename(originalname: string): string {
    const timestamp: string = Date.now().toString();
    const randomString: string = crypto.randomBytes(8).toString("hex");
    const extension: string = originalname.split(".").pop() || "";
    return `${timestamp}-${randomString}.${extension}`;
  }

  static getFileUrl(filename: string): string {
    return `/uploads/transactions/${filename}`;
  }

  static getFilePath(filename: string): string {
    return join(this.UPLOAD_DIR, filename);
  }
}
