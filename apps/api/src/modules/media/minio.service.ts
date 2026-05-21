import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const nodeEnv = config.get<string>('NODE_ENV') ?? 'development';
    const endPoint = config.get<string>('MINIO_ENDPOINT') ?? (nodeEnv === 'production' ? undefined : 'localhost');
    const port = config.get<number>('MINIO_PORT') ?? 9000;
    const accessKey = config.get<string>('MINIO_ACCESS_KEY') ?? (nodeEnv === 'production' ? undefined : 'minio_dev_access');
    const secretKey = config.get<string>('MINIO_SECRET_KEY') ?? (nodeEnv === 'production' ? undefined : 'minio_dev_secret');

    this.bucket = config.get<string>('MINIO_BUCKET') ?? 'mairie-media';
    const useSSL = config.get<boolean>('MINIO_USE_SSL');

    if (!endPoint || !accessKey || !secretKey) {
      throw new Error('Missing MinIO configuration. Set MINIO_ENDPOINT, MINIO_ACCESS_KEY and MINIO_SECRET_KEY.');
    }

    this.client = new Client({
      endPoint,
      port,
      useSSL: useSSL ?? nodeEnv === 'production',
      accessKey,
      secretKey,
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  getBucket() {
    return this.bucket;
  }

  async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket).catch(() => false);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'fr-par');
      this.logger.log(`Created bucket ${this.bucket}`);
    }
  }

  async presignedPutObject(objectName: string, expirySeconds = 60 * 10) {
    return this.client.presignedPutObject(this.bucket, objectName, expirySeconds);
  }

  async presignedGetObject(objectName: string, expirySeconds = 60 * 10) {
    return this.client.presignedGetObject(this.bucket, objectName, expirySeconds);
  }

  async putObject(objectName: string, data: Buffer, size?: number, metaData?: Record<string, string>) {
    return this.client.putObject(this.bucket, objectName, data, size, metaData);
  }

  async statObject(objectName: string) {
    return this.client.statObject(this.bucket, objectName);
  }

  async removeObject(objectName: string) {
    return this.client.removeObject(this.bucket, objectName);
  }

  async getObjectStream(objectName: string) {
    return this.client.getObject(this.bucket, objectName);
  }
}
