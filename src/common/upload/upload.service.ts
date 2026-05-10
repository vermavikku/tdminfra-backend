import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, subfolder: string): Promise<string> {
    const targetDirectory = path.join(this.uploadPath, subfolder);
    
    // Ensure the subfolder exists
    if (!fs.existsSync(targetDirectory)) {
      fs.mkdirSync(targetDirectory, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${crypto.randomBytes(16).toString('hex')}.${fileExtension}`;
    const filePath = path.join(targetDirectory, fileName);

    // Write file to disk
    await fs.promises.writeFile(filePath, file.buffer);

    // Return relative URL path for database storage
    return `/uploads/${subfolder}/${fileName}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    if (!filePath.startsWith('/uploads/')) {
      return; // Don't delete files outside uploads directory
    }

    const fullPath = path.join(process.cwd(), filePath);
    
    try {
      await fs.promises.unlink(fullPath);
    } catch (error) {
      // File might not exist, ignore error
      console.warn(`Failed to delete file ${fullPath}:`, error.message);
    }
  }
}
