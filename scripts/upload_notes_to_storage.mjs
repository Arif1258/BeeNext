import fs from "fs";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

// Load .env and .env.local
function loadEnv() {
  const env = {};
  for (const file of [".env", ".env.local"]) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim().replace(/^["']|["']$/g, "");
          env[key] = val;
        }
      }
    }
  }
  return env;
}

const env = { ...process.env, ...loadEnv() };

const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID?.trim() || "";
const S3_ENDPOINT =
  env.S3_ENDPOINT?.trim() ||
  (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "");

const ACCESS_KEY_ID =
  env.R2_ACCESS_KEY_ID?.trim() ||
  env.AWS_ACCESS_KEY_ID?.trim() ||
  env.S3_ACCESS_KEY_ID?.trim() ||
  "";

const SECRET_ACCESS_KEY =
  env.R2_SECRET_ACCESS_KEY?.trim() ||
  env.AWS_SECRET_ACCESS_KEY?.trim() ||
  env.S3_SECRET_ACCESS_KEY?.trim() ||
  "";

const BUCKET_NAME =
  env.R2_BUCKET_NAME?.trim() ||
  env.AWS_S3_BUCKET_NAME?.trim() ||
  env.S3_BUCKET_NAME?.trim() ||
  "beenext-notes";

const REGION = env.AWS_REGION?.trim() || env.S3_REGION?.trim() || "auto";

console.log("=================================================");
console.log("   BeeNext Protected Notes Cloud Storage Uploader");
console.log("=================================================");
console.log(`Endpoint:    ${S3_ENDPOINT || "AWS default"}`);
console.log(`Bucket Name: ${BUCKET_NAME}`);
console.log(`Region:      ${REGION}`);
console.log(`Access Key:  ${ACCESS_KEY_ID ? ACCESS_KEY_ID.substring(0, 6) + "..." : "NOT SET"}`);
console.log("-------------------------------------------------");

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY || (!S3_ENDPOINT && !env.AWS_REGION)) {
  console.error("❌ ERROR: Cloud storage credentials are missing or incomplete.");
  console.error("\nPlease set the following in .env or provide via environment:");
  console.error("For Cloudflare R2 (Recommended, 100% Free 10GB tier, Zero Egress Fees):");
  console.error("  R2_ACCOUNT_ID=your_cloudflare_account_id");
  console.error("  R2_ACCESS_KEY_ID=your_r2_access_key_id");
  console.error("  R2_SECRET_ACCESS_KEY=your_r2_secret_access_key");
  console.error("  R2_BUCKET_NAME=beenext-notes (or your chosen bucket name)");
  console.error("\nFor AWS S3:");
  console.error("  AWS_ACCESS_KEY_ID=your_aws_access_key");
  console.error("  AWS_SECRET_ACCESS_KEY=your_aws_secret_key");
  console.error("  AWS_REGION=your_aws_region (e.g. us-east-1)");
  console.error("  AWS_S3_BUCKET_NAME=your_s3_bucket_name");
  process.exit(1);
}

const s3 = new S3Client({
  region: REGION,
  endpoint: S3_ENDPOINT || undefined,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  forcePathStyle: Boolean(S3_ENDPOINT),
});

// All 21 mapped notes and their relative storage keys
const MAPPED_NOTES = [
  // Section 1: DSA
  { key: "Sorting_Algorithms.pdf", path: "Sorting_Algorithms.pdf" },
  { key: "Arrays.pdf", path: "Arrays.pdf" },
  { key: "Dynamic_Programming.pdf", path: "Dynamic_Programming.pdf" },

  // Section 2: CS Fundamentals
  { key: "DBMS/DBMS.pdf", path: "DBMS/DBMS.pdf" },
  { key: "Operating_Systems/Operating_Systems.pdf", path: "Operating_Systems/Operating_Systems.pdf" },
  { key: "Computer_Networks/Computer_Networks.pdf", path: "Computer_Networks/Computer_Networks.pdf" },
  { key: "OOPS/OOPS.pdf", path: "OOPS/OOPS.pdf" },

  // Section 3: Programming Languages
  { key: "C_Programming/C_Programming.pdf", path: "C_Programming/C_Programming.pdf" },
  { key: "C++_Programming/C++_Programming.pdf", path: "C++_Programming/C++_Programming.pdf" },
  { key: "Java_Programming/Java_Programming.pdf", path: "Java_Programming/Java_Programming.pdf" },
  { key: "Python_Programming/Python_Programming.pdf", path: "Python_Programming/Python_Programming.pdf" },

  // Section 4: Frontend Development
  { key: "HTML/HTML.pdf", path: "HTML/HTML.pdf" },
  { key: "CSS/CSS.pdf", path: "CSS/CSS.pdf" },
  { key: "JavaScript/JavaScript.pdf", path: "JavaScript/JavaScript.pdf" },
  { key: "React/React.pdf", path: "React/React.pdf" },

  // Section 5: Backend Development
  { key: "Node_js/Node_js.pdf", path: "Node_js/Node_js.pdf" },
  { key: "Express_js/Express_js.pdf", path: "Express_js/Express_js.pdf" },
  { key: "Spring_Boot/Spring_Boot.pdf", path: "Spring_Boot/Spring_Boot.pdf" },

  // Section 6: Database
  { key: "MySQL/MySQL.pdf", path: "MySQL/MySQL.pdf" },
  { key: "MongoDB/MongoDB.pdf", path: "MongoDB/MongoDB.pdf" },

  // Section 7: DevOps
  { key: "Docker/Docker.pdf", path: "Docker/Docker.pdf" },
  { key: "Kubernetes/Kubernetes.pdf", path: "Kubernetes/Kubernetes.pdf" },

  // Section 8: Version Control
  { key: "Git_and_GitHub/Git_and_GitHub.pdf", path: "Git_and_GitHub/Git_and_GitHub.pdf" },
];

async function main() {
  const vaultRoot = path.resolve(process.cwd(), "protected_notes");
  if (!fs.existsSync(vaultRoot)) {
    console.error(`❌ Vault directory ${vaultRoot} not found.`);
    process.exit(1);
  }

  console.log(`\nScanning ${vaultRoot} for notes...`);

  let uploadedCount = 0;
  let totalBytes = 0;

  for (const item of MAPPED_NOTES) {
    const fullPath = path.resolve(vaultRoot, item.path);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Warning: Local file not found: ${fullPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const sizeMb = (fileBuffer.length / (1024 * 1024)).toFixed(2);

    process.stdout.write(`Uploading ${item.key} (${sizeMb} MB)... `);

    try {
      // 1. Upload with hierarchical key (e.g. DBMS/DBMS.pdf)
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: item.key,
          Body: fileBuffer,
          ContentType: "application/pdf",
        })
      );

      // 2. Also upload with flat key (e.g. DBMS.pdf) for direct filename lookup resilience
      const flatKey = path.basename(item.path);
      if (flatKey !== item.key) {
        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: flatKey,
            Body: fileBuffer,
            ContentType: "application/pdf",
          })
        );
      }

      // Verify
      await s3.send(
        new HeadObjectCommand({
          Bucket: BUCKET_NAME,
          Key: item.key,
        })
      );

      console.log(`✅ OK`);
      uploadedCount++;
      totalBytes += fileBuffer.length;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
    }
  }

  console.log("-------------------------------------------------");
  console.log(`🎉 Finished! Successfully uploaded ${uploadedCount} notes (${(totalBytes / 1024 / 1024).toFixed(2)} MB) to bucket "${BUCKET_NAME}".`);
}

main().catch((err) => {
  console.error("Upload script failed:", err);
  process.exit(1);
});
