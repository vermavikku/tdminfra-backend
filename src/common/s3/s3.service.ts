import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private configService: ConfigService) {
    this.region =
      this.configService.get<string>('AWS_S3_REGION') ||
      this.configService.get<string>('AWS_REGION') ||
      'ap-south-1'; // Default to Mumbai region

    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    if (!bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME is not configured.');
    }
    this.bucketName = bucketName;

    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are not configured.');
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder?: string): Promise<string> {
    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME is not configured.');
    }

    const extension = file.originalname.split('.').pop() || 'bin';
    const fileName = `${crypto.randomBytes(16).toString('hex')}.${extension}`;
    const objectKey = folder ? `${folder}/${fileName}` : fileName;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${objectKey}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3.');
    }
  }
}
