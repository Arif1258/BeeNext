import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  NoSuchKey,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

// Environment variables configuration for Cloudflare R2 or AWS S3
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID?.trim() || "";
const S3_ENDPOINT =
  process.env.S3_ENDPOINT?.trim() ||
  (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "");

const ACCESS_KEY_ID =
  process.env.R2_ACCESS_KEY_ID?.trim() ||
  process.env.AWS_ACCESS_KEY_ID?.trim() ||
  process.env.S3_ACCESS_KEY_ID?.trim() ||
  "";

const SECRET_ACCESS_KEY =
  process.env.R2_SECRET_ACCESS_KEY?.trim() ||
  process.env.AWS_SECRET_ACCESS_KEY?.trim() ||
  process.env.S3_SECRET_ACCESS_KEY?.trim() ||
  "";

const BUCKET_NAME =
  process.env.R2_BUCKET_NAME?.trim() ||
  process.env.AWS_S3_BUCKET_NAME?.trim() ||
  process.env.S3_BUCKET_NAME?.trim() ||
  "beenext-notes";

const REGION =
  process.env.AWS_REGION?.trim() ||
  process.env.S3_REGION?.trim() ||
  "auto"; // "auto" is standard for Cloudflare R2

export function isCloudStorageConfigured(): boolean {
  return Boolean(ACCESS_KEY_ID && SECRET_ACCESS_KEY && (S3_ENDPOINT || process.env.AWS_REGION));
}

let cachedS3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (!isCloudStorageConfigured()) {
    return null;
  }
  if (!cachedS3Client) {
    cachedS3Client = new S3Client({
      region: REGION,
      endpoint: S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
      },
      // Force path style is recommended for Cloudflare R2 and custom S3 endpoints
      forcePathStyle: Boolean(S3_ENDPOINT),
    });
  }
  return cachedS3Client;
}

export interface CloudStorageNoteResponse {
  stream: ReadableStream | Uint8Array;
  contentLength?: number;
  contentRange?: string;
  contentType: string;
  statusCode: number;
}

/**
 * Converts a Node Readable to a web ReadableStream
 */
function nodeStreamToWebStream(nodeStream: Readable): ReadableStream {
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      nodeStream.on("end", () => {
        controller.close();
      });
      nodeStream.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

/**
 * Fetches a private note PDF from private S3 / R2 storage.
 * Supports HTTP Range requests for fast, chunked streaming to PDF.js.
 */
export async function getPrivateCloudNote(
  storageKey: string,
  rangeHeader?: string | null
): Promise<CloudStorageNoteResponse | null> {
  const client = getS3Client();
  if (!client) {
    return null;
  }

  // Potential object keys in bucket: e.g. "DBMS/DBMS.pdf" or "DBMS.pdf"
  const candidateKeys = [storageKey, storageKey.split("/").pop()].filter(Boolean) as string[];

  for (const key of candidateKeys) {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Range: rangeHeader || undefined,
      });

      const response = await client.send(command);

      if (!response.Body) {
        continue;
      }

      let webStream: ReadableStream | Uint8Array;
      if (typeof (response.Body as any).pipe === "function") {
        webStream = nodeStreamToWebStream(response.Body as Readable);
      } else if (typeof (response.Body as any).transformToByteArray === "function") {
        webStream = await (response.Body as any).transformToByteArray();
      } else {
        webStream = response.Body as unknown as ReadableStream;
      }

      return {
        stream: webStream,
        contentLength: response.ContentLength,
        contentRange: response.ContentRange,
        contentType: response.ContentType || "application/pdf",
        statusCode: response.ContentRange ? 206 : 200,
      };
    } catch (err: any) {
      if (err instanceof NoSuchKey || err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
        // Try next candidate key
        continue;
      }
      console.error(`[CloudStorage] Error fetching key "${key}":`, err?.message || err);
    }
  }

  return null;
}

/**
 * Uploads a note PDF buffer to private S3 / R2 storage
 */
export async function uploadPrivateCloudNote(
  storageKey: string,
  buffer: Buffer,
  contentType: string = "application/pdf"
): Promise<boolean> {
  const client = getS3Client();
  if (!client) {
    throw new Error("Cloud storage is not configured with required credentials.");
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: storageKey,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);
  return true;
}

/**
 * Verifies existence of an object in the private bucket
 */
export async function checkPrivateCloudNoteExists(storageKey: string): Promise<boolean> {
  const client = getS3Client();
  if (!client) return false;

  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: storageKey,
      })
    );
    return true;
  } catch {
    return false;
  }
}
