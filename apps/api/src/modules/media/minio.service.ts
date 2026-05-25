import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Client;
  private readonly publicClient: Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly config: ConfigService) {
    const nodeEnv = config.get<string>('NODE_ENV') ?? 'development';
    const internalEndPoint =
      config.get<string>('MINIO_ENDPOINT') ?? (nodeEnv === 'production' ? undefined : 'localhost');
    const internalPort = config.get<number>('MINIO_PORT') ?? 9000;
    const accessKey =
      config.get<string>('MINIO_ACCESS_KEY') ?? (nodeEnv === 'production' ? undefined : 'minio_dev_access');
    const secretKey =
      config.get<string>('MINIO_SECRET_KEY') ?? (nodeEnv === 'production' ? undefined : 'minio_dev_secret');
    const internalUseSSL = config.get<boolean>('MINIO_USE_SSL') ?? nodeEnv === 'production';

    this.bucket = config.get<string>('MINIO_BUCKET') ?? 'mairie-media';
    this.region = config.get<string>('MINIO_REGION') ?? 'us-east-1';

    if (!internalEndPoint || !accessKey || !secretKey) {
      throw new Error('Missing MinIO configuration. Set MINIO_ENDPOINT, MINIO_ACCESS_KEY and MINIO_SECRET_KEY.');
    }

    const publicEndPoint = config.get<string>('MINIO_PUBLIC_ENDPOINT') ?? internalEndPoint;
    const publicUseSSL = config.get<boolean>('MINIO_PUBLIC_USE_SSL') ?? internalUseSSL;
    const publicPort = config.get<number>('MINIO_PUBLIC_PORT') ?? (publicUseSSL ? 443 : internalPort);

    this.client = new Client({
      endPoint: internalEndPoint,
      port: internalPort,
      useSSL: internalUseSSL,
      accessKey,
      secretKey,
      region: this.region,
    });

    this.publicClient = new Client({
      endPoint: publicEndPoint,
      port: publicPort,
      useSSL: publicUseSSL,
      accessKey,
      secretKey,
      region: this.region,
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
      await this.client.makeBucket(this.bucket, this.region);
      this.logger.log(`Created bucket ${this.bucket}`);
    }
  }

  async presignedPutObject(objectName: string, expirySeconds = 60 * 10) {
    return this.publicClient.presignedPutObject(this.bucket, objectName, expirySeconds);
  }

  async presignedGetObject(objectName: string, expirySeconds = 60 * 10) {
    return this.publicClient.presignedGetObject(this.bucket, objectName, expirySeconds);
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
