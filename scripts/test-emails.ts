/**
 * Sends a test of every email type to bozzellapellegrino@gmail.com
 * Run: npx tsx scripts/test-emails.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import {
  sendWelcomeEmail,
  sendConfirmationEmail,
  sendPasswordResetEmail,
  sendSubscriptionActiveEmail,
  sendTrialEndingEmail,
} from "../src/lib/email";

const TO = "bozzellapellegrino@gmail.com";
const APP_URL = "https://clicmenu.ai";

async function main() {
  console.log("📧 Invio email di test a", TO, "\n");

  const results = await Promise.allSettled([
    sendWelcomeEmail(TO, "Mario Rossi", APP_URL).then(() =>
      console.log("✅ 1/5 Welcome email inviata")
    ),
    sendConfirmationEmail(TO, `${APP_URL}/signup?confirm=demo-token-12345`).then(() =>
      console.log("✅ 2/5 Confirmation email inviata")
    ),
    sendPasswordResetEmail(TO, `${APP_URL}/reset-password?token=demo-reset-67890`).then(() =>
      console.log("✅ 3/5 Password reset email inviata")
    ),
    sendSubscriptionActiveEmail(TO, "Mario Rossi", APP_URL).then(() =>
      console.log("✅ 4/5 Subscription active email inviata")
    ),
    sendTrialEndingEmail(TO, "Mario Rossi", 3, APP_URL).then(() =>
      console.log("✅ 5/5 Trial ending email inviata")
    ),
  ]);

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error("\n❌ Errori:");
    failed.forEach((r) => {
      if (r.status === "rejected") console.error(" -", r.reason);
    });
  } else {
    console.log("\n🎉 Tutte le email inviate con successo!");
    console.log("📬 Controlla la casella:", TO);
  }
}

main().catch(console.error);
