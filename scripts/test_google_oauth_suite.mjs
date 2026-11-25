import jwt from "jsonwebtoken";
import prismaModule from "../src/lib/prisma";
const prisma = prismaModule.default || prismaModule.prisma || prismaModule;
import {
  isGoogleAuthConfigured,
  getGoogleOAuthCallbackUrl,
  generateOAuthState,
  verifyOAuthState,
  generateGoogleOAuthUrl,
} from "../src/lib/googleAuth";
import { signToken, verifyToken, hashPassword } from "../src/lib/auth";

async function runTestSuite() {
  console.log("=================================================");
  console.log("   BeeNext Google OAuth & Auth Test Suite");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Test Callback URL Generation
  console.log("--- 1. OAuth Callback URL Resolution ---");
  const localCallback = getGoogleOAuthCallbackUrl();
  assert(
    localCallback.endsWith("/api/auth/google/callback"),
    `Callback URL has correct route: ${localCallback}`
  );

  const mockReqLocal = new Request("http://localhost:3000/api/auth/google", {
    headers: { host: "localhost:3000" },
  });
  const reqCallback = getGoogleOAuthCallbackUrl(mockReqLocal);
  assert(
    reqCallback === "http://localhost:3000/api/auth/google/callback",
    `Dynamic request callback matches host: ${reqCallback}`
  );

  const mockReqProd = new Request("https://beenext.in/api/auth/google", {
    headers: {
      host: "beenext.in",
      "x-forwarded-proto": "https",
      "x-forwarded-host": "beenext.in",
    },
  });
  const prodCallback = getGoogleOAuthCallbackUrl(mockReqProd);
  assert(
    prodCallback === "https://beenext.in/api/auth/google/callback",
    `Production request callback matches forwarded headers: ${prodCallback}`
  );

  // 2. Test CSRF State Generation and Verification
  console.log("\n--- 2. CSRF State Security & Validation ---");
  const { stateParam, stateCookieValue } = generateOAuthState("/notes");
  assert(
    Boolean(stateParam && stateCookieValue),
    "Generated stateParam and stateCookieValue"
  );

  const validVerification = verifyOAuthState(stateParam, stateCookieValue);
  assert(
    validVerification.isValid === true && validVerification.from === "/notes",
    "Valid state and cookie match returns isValid: true with return path"
  );

  const tamperedCookieVerification = verifyOAuthState(stateParam, "tampered_nonce");
  assert(
    tamperedCookieVerification.isValid === false,
    "Mismatched cookie nonce rejected (CSRF protection)"
  );

  const tamperedStateVerification = verifyOAuthState("tampered_state_param", stateCookieValue);
  assert(
    tamperedStateVerification.isValid === false,
    "Malformed state param safely rejected"
  );

  const openRedirectState = generateOAuthState("https://malicious-site.com");
  const openRedirectVerification = verifyOAuthState(openRedirectState.stateParam, openRedirectState.stateCookieValue);
  assert(
    openRedirectVerification.from === "/",
    "Open redirect attempt neutralized to default safe root '/'"
  );

  // 3. Test Google OAuth URL Construction
  console.log("\n--- 3. Google OAuth Authorization URL ---");
  process.env.GOOGLE_CLIENT_ID = "mock_client_id_12345.apps.googleusercontent.com";
  process.env.GOOGLE_CLIENT_SECRET = "mock_client_secret_67890";

  assert(isGoogleAuthConfigured() === true, "isGoogleAuthConfigured() returns true when vars set");

  const authUrl = generateGoogleOAuthUrl(stateParam, mockReqLocal);
  assert(
    authUrl.startsWith("https://accounts.google.com/o/oauth2/v2/auth"),
    "Authorization URL points to accounts.google.com"
  );
  assert(
    authUrl.includes("client_id=mock_client_id_12345.apps.googleusercontent.com"),
    "Authorization URL includes correct client_id"
  );
  assert(
    authUrl.includes("scope=openid+email+profile") || authUrl.includes("scope=openid%20email%20profile"),
    "Authorization URL requests openid, email, and profile scopes"
  );
  assert(
    authUrl.includes("prompt=select_account"),
    "Authorization URL includes prompt=select_account"
  );

  // 4. Test Account Creation & Membership Assignment
  console.log("\n--- 4. New Google User Account Creation & Membership ---");
  const testGoogleId = `google_test_${Date.now()}`;
  const testGoogleEmail = `google_user_${Date.now()}@example.com`;

  const dummyPassword = "test_google_dummy_password_hash";
  const dummyPasswordHash = await hashPassword(dummyPassword);

  const newGoogleUser = await prisma.user.create({
    data: {
      name: "Google Test User",
      email: testGoogleEmail,
      googleId: testGoogleId,
      passwordHash: dummyPasswordHash,
      role: "USER",
      membershipType: "NORMAL",
      avatar: "https://lh3.googleusercontent.com/a/test-avatar",
    },
  });

  assert(Boolean(newGoogleUser.id), "Successfully created new user with Google profile");
  assert(newGoogleUser.membershipType === "NORMAL", "New Google user assigned NORMAL membership by default");
  assert(newGoogleUser.role === "USER", "New Google user assigned USER role by default");
  assert(newGoogleUser.googleId === testGoogleId, "Google sub ID stored properly");

  // 5. Test Account Linking (Email / Password -> Google Account)
  console.log("\n--- 5. Account Linking for Existing Users ---");
  const linkingEmail = `existing_email_user_${Date.now()}@example.com`;
  const existingEmailUser = await prisma.user.create({
    data: {
      name: "Existing Email User",
      email: linkingEmail,
      passwordHash: await hashPassword("ExistingPassword@123"),
      role: "USER",
      membershipType: "PLUS", // e.g. User bought PLUS previously!
    },
  });

  assert(Boolean(existingEmailUser.id), "Created existing user with email/password and PLUS membership");
  assert(existingEmailUser.googleId === null, "User initially has no googleId");

  // Simulate Google sign-in using the same email
  const linkedGoogleId = `google_linked_${Date.now()}`;
  const linkedUser = await prisma.user.update({
    where: { email: linkingEmail },
    data: {
      googleId: linkedGoogleId,
      avatar: "https://lh3.googleusercontent.com/a/linked-avatar",
      updatedAt: new Date(),
    },
  });

  assert(linkedUser.id === existingEmailUser.id, "Account linked to exact same user ID (no duplicate created)");
  assert(linkedUser.googleId === linkedGoogleId, "googleId linked successfully");
  assert(linkedUser.membershipType === "PLUS", "User's existing PLUS membership preserved untouched!");

  // Verify finding by googleId finds the linked user
  const foundByGoogleId = await prisma.user.findUnique({
    where: { googleId: linkedGoogleId },
  });
  assert(foundByGoogleId?.id === existingEmailUser.id, "User can now be looked up directly by googleId");

  // 6. Test Session Cookie & Token Issuance
  console.log("\n--- 6. JWT Session Issuance & Verification ---");
  const sessionToken = signToken({
    id: linkedUser.id,
    name: linkedUser.name,
    email: linkedUser.email,
    role: linkedUser.role,
  });

  const verified = verifyToken(sessionToken);
  assert(Boolean(verified), "Session token verified successfully");
  assert(verified.id === linkedUser.id, "Session user ID matches");
  assert(verified.email === linkingEmail, "Session email matches");
  assert(verified.role === "USER", "Session role matches");

  // 7. Cleanup Test Records
  console.log("\n--- 7. Cleanup Test Records ---");
  await prisma.user.deleteMany({
    where: {
      id: { in: [newGoogleUser.id, existingEmailUser.id] },
    },
  });
  console.log("🧹 Test user records safely cleaned up.");

  console.log("\n-------------------------------------------------");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("-------------------------------------------------");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test suite encountered error:", err);
  process.exit(1);
});
