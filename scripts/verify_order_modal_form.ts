import fs from "fs";
import path from "path";

async function main() {
  console.log("==================================================");
  console.log("VERIFYING ORDER NOW CHECKOUT FORM REQUIREMENTS");
  console.log("==================================================");

  const modalPath = path.join(process.cwd(), "src/components/PrintedOrderModal.tsx");
  const modalContent = fs.readFileSync(modalPath, "utf8");

  // [Test 1] Verify empty form default state on open
  console.log("\n[Test 1] Checking default empty input state...");
  if (!modalContent.includes("const EMPTY_FORM_DATA = {")) {
    throw new Error("Missing EMPTY_FORM_DATA constant in PrintedOrderModal.tsx");
  }
  if (!modalContent.includes("setFormData(EMPTY_FORM_DATA);")) {
    throw new Error("Modal must reset formData to EMPTY_FORM_DATA when isOpen changes!");
  }
  if (modalContent.includes("customerName: currentUser?.name ||") || modalContent.includes("customerEmail: currentUser?.email ||")) {
    throw new Error("Inputs should not prefill user credentials by default!");
  }
  console.log("✓ All fields are configured to be completely empty by default on Order Now click");

  // [Test 2] Verify white background and clean border styling
  console.log("\n[Test 2] Checking white background and clean border styling...");
  if (!modalContent.includes("bg-white")) {
    throw new Error("Input fields must have a clear white background (bg-white)!");
  }
  if (!modalContent.includes("border-neutral-300")) {
    throw new Error("Input fields must have clean borders (border-neutral-300)!");
  }
  if (!modalContent.includes("text-neutral-900")) {
    throw new Error("Input fields must have crisp readable text (text-neutral-900)!");
  }
  console.log("✓ Input fields have clean borders and clear white background");

  // [Test 3] Verify subtle but clear placeholder text
  console.log("\n[Test 3] Checking placeholder text and styling...");
  const expectedPlaceholders = [
    'placeholder="Enter your full name"',
    'placeholder="Enter phone number"',
    'placeholder="Enter email address"',
    'placeholder="Enter delivery address"',
    'placeholder="Enter PIN code"',
    'placeholder="Enter city"',
    'placeholder="Enter state"',
  ];

  for (const ph of expectedPlaceholders) {
    if (!modalContent.includes(ph)) {
      throw new Error(`Missing expected placeholder: ${ph}`);
    }
  }

  // Check no sample data in placeholders
  if (modalContent.includes('placeholder="e.g. Rahul Sharma"') || modalContent.includes('placeholder="110016"')) {
    throw new Error("Sample data placeholders (e.g. Rahul Sharma, 110016) should be removed!");
  }

  if (!modalContent.includes("placeholder:text-neutral-400")) {
    throw new Error("Placeholder text must use subtle readable styling (placeholder:text-neutral-400)!");
  }
  console.log("✓ Placeholders are clear, subtle, and readable without hazy/blurry sample data");

  // [Test 4] Verify focus border styling
  console.log("\n[Test 4] Checking focus border styling...");
  if (!modalContent.includes("focus:border-brand-red")) {
    throw new Error("Input fields must show a clear focus border on click (focus:border-brand-red)!");
  }
  console.log("✓ Clear focus border configured for active inputs");

  // [Test 5] Verify visible labels and consistent field heights
  console.log("\n[Test 5] Checking visible labels and consistent heights...");
  if (!modalContent.includes("h-11")) {
    throw new Error("Input fields must have consistent field heights (h-11)!");
  }
  if (!modalContent.includes("text-neutral-200")) {
    throw new Error("Labels must be clearly visible above each field (text-neutral-200)!");
  }
  console.log("✓ Clearly visible labels and consistent field heights verified");

  console.log("\n==================================================");
  console.log("ALL ORDER NOW CHECKOUT FORM CHECKS PASSED! ✓");
  console.log("==================================================");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
