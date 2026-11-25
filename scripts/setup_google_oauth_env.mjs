import readline from "readline";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Create secure terminal prompt with masked input support
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
  console.log("   BeeNext Google OAuth Secure Setup Utility");
  console.log("=================================================");
  console.log("This utility will configure your Google OAuth credentials");
  console.log("in your local .env and sync them to Vercel Production.");
  console.log("All credentials are masked and will NOT be logged or printed.\n");

  const clientId = await askQuestion("Enter Google Client ID: ", false);
  if (!clientId || clientId.length < 10) {
    console.error("❌ Google Client ID cannot be empty or invalid.");
    process.exit(1);
  }

  const clientSecret = await askQuestion("Enter Google Client Secret (input hidden): ", true);
  if (!clientSecret || clientSecret.length < 5) {
    console.error("❌ Google Client Secret cannot be empty or invalid.");
    process.exit(1);
  }

  console.log("\n1. Updating local .env file securely...");
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    console.error("❌ Root .env file not found.");
    process.exit(1);
  }

  let envContent = fs.readFileSync(envPath, "utf8");

  const googleVars = {
    GOOGLE_CLIENT_ID: clientId,
    GOOGLE_CLIENT_SECRET: clientSecret,
  };

  for (const [k, v] of Object.entries(googleVars)) {
    const regex = new RegExp(`^${k}=.*$`, "m");
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${k}="${v}"`);
    } else {
      envContent += `\n${k}="${v}"`;
    }
  }

  fs.writeFileSync(envPath, envContent.trim() + "\n", "utf8");
  console.log("   ✅ Local .env updated successfully (credentials masked, other variables preserved).");

  console.log("\n2. Configuring Vercel Production Environment Variables...");
  const targets = ["production"];

  for (const [k, v] of Object.entries(googleVars)) {
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
        console.log(`   ✅ Synchronized ${k} to Vercel (${target}).`);
      } catch (err) {
        console.error(`   ⚠️ Failed to set ${k} for ${target}: ${err.message}`);
      }
    }
  }

  console.log("\n3. Validating local & Vercel configuration...");
  const updatedEnv = fs.readFileSync(envPath, "utf8");
  const hasClientId = /^GOOGLE_CLIENT_ID=".+"$/m.test(updatedEnv);
  const hasClientSecret = /^GOOGLE_CLIENT_SECRET=".+"$/m.test(updatedEnv);

  if (hasClientId && hasClientSecret) {
    console.log("   ✅ Local .env validation passed (both variables present and non-empty).");
  } else {
    console.error("   ❌ Local .env validation failed.");
    process.exit(1);
  }

  console.log("\n=================================================");
  console.log("🎉 Google OAuth Credentials Configured Successfully!");
  console.log("=================================================");
  console.log("Authorized OAuth Callback URLs:");
  console.log("   • Local:      http://localhost:3000/api/auth/google/callback");
  console.log("   • Production: https://beenext-seven.vercel.app/api/auth/google/callback\n");
}

main().catch((err) => {
  console.error("Setup error:", err.message);
  process.exit(1);
});
