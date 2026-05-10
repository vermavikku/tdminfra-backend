import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { process } from 'node_modules/@getbrevo/brevo/dist/esm/api/resources/index.mjs';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: process.env.AWS_S3_BUCKET_NAME;
  private region: process.env.AWS_S3_REGION;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get('AWS_S3_REGION') || 'ap-south-1'; // Default to Mumbai region
    
    const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
    if (!bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME is not configured.');
    }
    this.bucketName = bucketName;

    const accessKeyId = this.configService.get(process.env.AWS_ACCESS_KEY_ID);
    const secretAccessKey = this.configService.get(process.env.AWS_SECRET_ACCESS_KEY);

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

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME is not configured.');
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${crypto.randomBytes(16).toString('hex')}.${fileExtension}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.public_read, // Make the uploaded file publicly accessible
    };

    try {
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
      return fileUrl;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3.');
    }
  }
}
