import { execSync } from "child_process";

console.log("🚀 Starting Pre-deployment checks...\n");

try {
  console.log("📦 Step 1: Running production build (npm run build)...");
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ Production build completed successfully!\n");
} catch (error) {
  console.error("\n❌ Build failed! Please resolve the build errors before deploying.");
  process.exit(1);
}

try {
  console.log("🔍 Step 2: Running linter (npm run lint)...");
  execSync("npm run lint", { stdio: "inherit" });
  console.log("✅ Lint check passed successfully!\n");
} catch (error) {
  console.error("\n❌ Linting failed! Please resolve the linting issues before deploying.");
  process.exit(1);
}

console.log("======================================================");
console.log("🎉 AUTOMATED PRE-DEPLOY CHECKS PASSED!");
console.log("======================================================");
console.log("\n📝 MANUAL CHECKLIST TO VERIFY BEFORE DEPLOYMENT:");
console.log("------------------------------------------------------");
console.log("[ ] 1. Auth Flow tested (Login, Sign-Up, and Sign-Out)");
console.log("[ ] 2. Firestore reads/writes verified in practice");
console.log("[ ] 3. Payment / Mock Checkout Flow tested");
console.log("[ ] 4. Responsive UI check (Mobile layout & Dock menu)");
console.log("[ ] 5. Developer console in browser has zero exceptions");
console.log("------------------------------------------------------");
console.log("🔔 If all manual items are verified, proceed with merging dev -> main.\n");
