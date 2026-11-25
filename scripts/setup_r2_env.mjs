import readline from "readline";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Create secure terminal prompt
function askQuestion(query, isSecret = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (isSecret) {
      process.stdout.write(query);
      let buffer = "";
      process.stdin.setRawMode(true);
      process.stdin.resume();

      const onData = (char) => {
        const c = char.toString();
        if (c === "\n" || c === "\r" || c === "\u0004") {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n");
          rl.close();
          resolve(buffer.trim());
        } else if (c === "\u0003") {
          process.exit();
        } else if (c === "\u007F" || c === "\b") {
          if (buffer.length > 0) {
            buffer = buffer.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else {
          buffer += c;
          process.stdout.write("*");
        }
      };

      process.stdin.on("data", onData);
    } else {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function main() {
  console.log("=================================================");
  console.log("  BeeNext Secure Cloudflare R2 Setup Utility");
  console.log("=================================================");
  console.log("This utility will configure your private R2 credentials");
  console.log("in your local .env and sync them to Vercel Production.");
  console.log("All secrets are masked and will NOT be logged.\n");

  const accountId = await askQuestion("Enter Cloudflare Account ID: ", false);
  if (!accountId) {
    console.error("❌ Cloudflare Account ID cannot be empty.");
    process.exit(1);
  }

  const accessKeyId = await askQuestion("Enter R2 Access Key ID: ", false);
  if (!accessKeyId) {
    console.error("❌ R2 Access Key ID cannot be empty.");
    process.exit(1);
  }

  const secretAccessKey = await askQuestion("Enter R2 Secret Access Key (input hidden): ", true);
  if (!secretAccessKey) {
    console.error("❌ R2 Secret Access Key cannot be empty.");
    process.exit(1);
  }

  const bucketName = "beenext-notes";
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

  console.log("\n1. Verifying R2 bucket connectivity...");
  const s3 = new S3Client({
    region: "auto",
    endpoint: endpoint,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    forcePathStyle: true,
  });

  try {
    await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 1,
      })
    );
    console.log(`   ✅ Successfully connected to R2 bucket "${bucketName}"!`);
  } catch (err) {
    console.error(`   ❌ Failed to connect to R2 bucket "${bucketName}":`, err.message);
    console.error("   Please verify that your Account ID, Access Key ID, and Secret Access Key are correct.");
    process.exit(1);
  }

  console.log("\n2. Updating local .env file securely...");
  const envPath = path.resolve(process.cwd(), ".env");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

  const r2Vars = {
    R2_ACCOUNT_ID: accountId,
    R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey,
    R2_BUCKET_NAME: bucketName,
  };

  for (const [k, v] of Object.entries(r2Vars)) {
    const regex = new RegExp(`^${k}=.*$`, "m");
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${k}="${v}"`);
    } else {
      envContent += `\n${k}="${v}"`;
    }
  }

  fs.writeFileSync(envPath, envContent.trim() + "\n", "utf8");
  console.log("   ✅ Local .env updated successfully.");

  console.log("\n3. Configuring Vercel Production Environment Variables...");
  // Strictly configure Production environment only as required
  const targets = ["production"];

  for (const [k, v] of Object.entries(r2Vars)) {
    for (const target of targets) {
      try {
        execSync(`npx vercel env rm ${k} ${target} -y`, {
          stdio: ["pipe", "pipe", "pipe"],
        });
      } catch {
        // Ignored if variable does not exist yet
      }

      try {
        execSync(`npx vercel env add ${k} ${target}`, {
          input: v,
          stdio: ["pipe", "pipe", "pipe"],
        });
      } catch (err) {
        console.error(`   ⚠️ Failed to set ${k} for ${target} (exit code ${err.status || 1})`);
      }
    }
    console.log(`   ✅ Synchronized ${k} to Vercel (production).`);
  }

  console.log("\n=================================================");
  console.log("🎉 Cloudflare R2 Credentials Configured Successfully!");
  console.log("=================================================");
  console.log("You can now run:");
  console.log("   node scripts/upload_notes_to_storage.mjs");
  console.log("to upload and verify all 21 PDF notes in the bucket.\n");
}

main().catch((err) => {
  console.error("Setup error:", err.message);
  process.exit(1);
});
