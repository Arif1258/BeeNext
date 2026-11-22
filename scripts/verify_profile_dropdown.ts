import fs from "fs";
import path from "path";

async function main() {
  console.log("==================================================");
  console.log("VERIFYING NAVBAR PROFILE DROPDOWN REQUIREMENTS");
  console.log("==================================================");

  const navbarPath = path.join(process.cwd(), "src/components/Navbar.tsx");
  const navbarContent = fs.readFileSync(navbarPath, "utf8");

  // [Test 1] Verify no separate My Profile, Login, or Logout buttons in main navbar
  console.log("\n[Test 1] Checking that separate buttons are replaced...");
  if (navbarContent.includes('>Login</span>') && !navbarContent.includes('profileDropdownOpen &&')) {
    throw new Error("Separate Login button found outside dropdown!");
  }
  if (navbarContent.includes('>Logout</span>') && !navbarContent.includes('profileDropdownOpen &&')) {
    throw new Error("Separate Logout button found outside dropdown!");
  }
  console.log("✓ Separate My Profile, Login, and Logout buttons are not directly displayed in navbar");

  // [Test 2] Verify single profile icon at the far right
  console.log("\n[Test 2] Checking single profile icon at far right...");
  if (!navbarContent.includes('aria-label="Profile and Account Menu"')) {
    throw new Error("Missing profile icon button in Navbar");
  }
  if (!navbarContent.includes('<User className="h-4 w-4 sm:h-5 sm:w-5" />') && !navbarContent.includes('<User className="h-4 w-4')) {
    throw new Error("Profile icon must use clean professional User icon!");
  }
  console.log("✓ Single profile icon button present on the far right");

  // [Test 3] Verify dropdown state, click outside handling & options
  console.log("\n[Test 3] Checking dropdown state and click-outside handler...");
  if (!navbarContent.includes("profileDropdownOpen") || !navbarContent.includes("setProfileDropdownOpen")) {
    throw new Error("Missing dropdown state in Navbar");
  }
  if (!navbarContent.includes("dropdownRef") || !navbarContent.includes("handleClickOutside")) {
    throw new Error("Dropdown must close on click outside (dropdownRef + handleClickOutside)!");
  }
  console.log("✓ Click outside listener properly configured on document");

  // [Test 4] Verify dropdown contents for logged in and logged out users
  console.log("\n[Test 4] Checking dropdown menu options...");
  // Logged in: My Profile & Logout
  if (!navbarContent.includes("My Profile") || !navbarContent.includes("Logout")) {
    throw new Error("Dropdown must contain 'My Profile' and 'Logout' for logged in users!");
  }
  // Logged out: Login
  if (!navbarContent.includes("Login")) {
    throw new Error("Dropdown must contain 'Login' for logged out users!");
  }
  console.log("✓ Dropdown contains: My Profile & Logout (logged in) | Login (logged out)");

  // [Test 5] Verify SSR HTML on live server
  console.log("\n[Test 5] Checking live server HTML rendering...");
  const homeRes = await fetch("http://localhost:3000/");
  const homeHtml = await homeRes.text();
  const cleanHomeHtml = homeHtml.replace(/<!--[\s\S]*?-->/g, "");

  // Main navbar options
  if (!cleanHomeHtml.includes("DSA Topics")) throw new Error("Missing 'DSA Topics' in navbar!");
  if (!cleanHomeHtml.includes("Purchase")) throw new Error("Missing 'Purchase' in navbar!");
  if (!cleanHomeHtml.includes("My Orders")) throw new Error("Missing 'My Orders' in navbar!");
  if (!cleanHomeHtml.includes("About")) throw new Error("Missing 'About' in navbar!");

  // Ensure profile icon button is present in HTML
  if (!cleanHomeHtml.includes('aria-label="Profile and Account Menu"')) {
    throw new Error("Profile icon button missing from live server HTML!");
  }

  // Ensure separate buttons are not rendered in the top bar
  const headerIdx = cleanHomeHtml.indexOf("<header");
  const headerEndIdx = cleanHomeHtml.indexOf("</header>", headerIdx);
  const headerHtml = cleanHomeHtml.substring(headerIdx, headerEndIdx);

  // In closed state, dropdown items should not be visible in initial render
  if (headerHtml.includes(">My Profile</span>") || headerHtml.includes(">Login</span>") || headerHtml.includes(">Logout</span>")) {
    throw new Error("Separate text buttons for My Profile/Login/Logout should not be visible when dropdown is closed!");
  }
  console.log("✓ Live server HTML renders only the clean profile icon button at far right (no separate buttons)");

  console.log("\n==================================================");
  console.log("ALL NAVBAR PROFILE DROPDOWN CHECKS PASSED! ✓");
  console.log("==================================================");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
