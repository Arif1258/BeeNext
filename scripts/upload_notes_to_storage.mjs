import fs from "fs";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
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
console.log(`Bucket Name:       ${BUCKET_NAME}`);
console.log(`Region:            ${REGION}`);
console.log(`Endpoint Status:   ${S3_ENDPOINT ? "[CONFIGURED]" : "[NOT SET]"}`);
console.log(`Access Key Status: ${ACCESS_KEY_ID ? "[CONFIGURED]" : "[NOT SET]"}`);
console.log(`Secret Key Status: ${SECRET_ACCESS_KEY ? "[CONFIGURED]" : "[NOT SET]"}`);
console.log("-------------------------------------------------");

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !S3_ENDPOINT) {
  console.error("❌ ERROR: Cloud storage credentials are missing or incomplete in .env.");
  console.error("Required variables:");
  console.error("  R2_ACCOUNT_ID");
  console.error("  R2_ACCESS_KEY_ID");
  console.error("  R2_SECRET_ACCESS_KEY");
  console.error("  R2_BUCKET_NAME (default: beenext-notes)");
  process.exit(1);
}

const s3 = new S3Client({
  region: REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

// Exactly the 21 unique PDF notes required by the BeeNext Notes page
export const MAPPED_21_NOTES = [
  // 1. Section 1: DSA Topics Note
  { key: "Sorting_Algorithms.pdf", path: "Sorting_Algorithms.pdf" },

  // Section 2: CS Fundamentals (4 notes)
  { key: "DBMS/DBMS.pdf", path: "DBMS/DBMS.pdf" },
  { key: "Operating_Systems/Operating_Systems.pdf", path: "Operating_Systems/Operating_Systems.pdf" },
  { key: "Computer_Networks/Computer_Networks.pdf", path: "Computer_Networks/Computer_Networks.pdf" },
  { key: "OOPS/OOPS.pdf", path: "OOPS/OOPS.pdf" },

  // Section 3: Programming Languages (4 notes)
  { key: "C_Programming/C_Programming.pdf", path: "C_Programming/C_Programming.pdf" },
  { key: "C++_Programming/C++_Programming.pdf", path: "C++_Programming/C++_Programming.pdf" },
  { key: "Java_Programming/Java_Programming.pdf", path: "Java_Programming/Java_Programming.pdf" },
  { key: "Python_Programming/Python_Programming.pdf", path: "Python_Programming/Python_Programming.pdf" },

  // Section 4: Frontend Development (4 notes)
  { key: "HTML/HTML.pdf", path: "HTML/HTML.pdf" },
  { key: "CSS/CSS.pdf", path: "CSS/CSS.pdf" },
  { key: "JavaScript/JavaScript.pdf", path: "JavaScript/JavaScript.pdf" },
  { key: "React/React.pdf", path: "React/React.pdf" },

  // Section 5: Backend Development (3 notes)
  { key: "Node_js/Node_js.pdf", path: "Node_js/Node_js.pdf" },
  { key: "Express_js/Express_js.pdf", path: "Express_js/Express_js.pdf" },
  { key: "Spring_Boot/Spring_Boot.pdf", path: "Spring_Boot/Spring_Boot.pdf" },

  // Section 6: Database (2 notes)
  { key: "MySQL/MySQL.pdf", path: "MySQL/MySQL.pdf" },
  { key: "MongoDB/MongoDB.pdf", path: "MongoDB/MongoDB.pdf" },

  // Section 7: DevOps (2 notes)
  { key: "Docker/Docker.pdf", path: "Docker/Docker.pdf" },
  { key: "Kubernetes/Kubernetes.pdf", path: "Kubernetes/Kubernetes.pdf" },

  // Section 8: Version Control (1 note)
  { key: "Git_and_GitHub/Git_and_GitHub.pdf", path: "Git_and_GitHub/Git_and_GitHub.pdf" },
];

async function main() {
  const vaultRoot = path.resolve(process.cwd(), "protected_notes");
  if (!fs.existsSync(vaultRoot)) {
    console.error(`❌ Vault directory ${vaultRoot} not found.`);
    process.exit(1);
  }

  console.log(`Starting upload of exactly ${MAPPED_21_NOTES.length} required PDF notes to R2 bucket "${BUCKET_NAME}"...\n`);

  let uploadedCount = 0;
  let verifiedCount = 0;
  let totalBytes = 0;

  for (let i = 0; i < MAPPED_21_NOTES.length; i++) {
    const item = MAPPED_21_NOTES[i];
    const fullPath = path.resolve(vaultRoot, item.path);

    if (!fs.existsSync(fullPath)) {
      console.error(`❌ [${i + 1}/${MAPPED_21_NOTES.length}] MISSING local file: ${fullPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const sizeMb = (fileBuffer.length / (1024 * 1024)).toFixed(2);

    process.stdout.write(`[${i + 1}/${MAPPED_21_NOTES.length}] Uploading ${item.key} (${sizeMb} MB)... `);

    try {
      // Upload hierarchical key (e.g. DBMS/DBMS.pdf)
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: item.key,
          Body: fileBuffer,
          ContentType: "application/pdf",
        })
      );

      // If key is hierarchical, also upload flat basename (e.g. DBMS.pdf) for direct filename fallback
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

      uploadedCount++;
      totalBytes += fileBuffer.length;

      // Verify object exists in bucket using HeadObject
      const headRes = await s3.send(
        new HeadObjectCommand({
          Bucket: BUCKET_NAME,
          Key: item.key,
        })
      );

      if (headRes.ContentLength === fileBuffer.length) {
        console.log(`✅ Verified (${headRes.ContentLength} bytes)`);
        verifiedCount++;
      } else {
        console.log(`⚠️ Size mismatch on verification: expected ${fileBuffer.length}, got ${headRes.ContentLength}`);
      }
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
    }
  }

  console.log("\n-------------------------------------------------");
  console.log(`🎉 Summary:`);
  console.log(`   Total Notes Mapped:   ${MAPPED_21_NOTES.length}`);
  console.log(`   Successfully Uploaded: ${uploadedCount}`);
  console.log(`   HeadObject Verified:   ${verifiedCount}`);
  console.log(`   Total Data Uploaded:   ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log("-------------------------------------------------");

  if (verifiedCount !== MAPPED_21_NOTES.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Upload process encountered an error:", err.message);
  process.exit(1);
});
