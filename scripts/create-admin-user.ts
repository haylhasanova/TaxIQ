import "dotenv/config";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const args = process.argv.slice(2).filter((a) => !a.startsWith("dotenv_config_"));
const EMAIL = args[0] ?? "admin@taxiq.az";
const PASSWORD = args[1] ?? "TaxIQ-Admin-2026!";
const DISPLAY_NAME = "TaxIQ Admin";

async function main() {
  let user;
  try {
    user = await adminAuth.getUserByEmail(EMAIL);
  } catch {
    user = await adminAuth.createUser({
      email: EMAIL,
      password: PASSWORD,
      displayName: DISPLAY_NAME,
      emailVerified: true,
    });
  }

  await adminAuth.setCustomUserClaims(user.uid, { role: "super_admin" });

  await adminDb
    .collection("users")
    .doc(user.uid)
    .set(
      {
        uid: user.uid,
        email: EMAIL,
        displayName: DISPLAY_NAME,
        role: "super_admin",
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  console.log(`Admin user ready: ${EMAIL} (uid: ${user.uid})`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
