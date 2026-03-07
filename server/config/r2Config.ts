import { S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 client setup
export const r2 = new S3Client({
  region: "auto", // R2 S3 compatible always 'auto'
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET!;
