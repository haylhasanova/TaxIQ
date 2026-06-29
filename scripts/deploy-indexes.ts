import "dotenv/config";
import fs from "fs";
import { getAdminApp } from "@/lib/firebase/admin";

interface IndexField {
  fieldPath: string;
  order: "ASCENDING" | "DESCENDING";
}

interface IndexDef {
  collectionGroup: string;
  queryScope: string;
  fields: IndexField[];
}

async function main() {
  const app = getAdminApp();
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const token = await app.options.credential!.getAccessToken();

  const raw = fs.readFileSync("firestore.indexes.json", "utf8");
  const { indexes } = JSON.parse(raw) as { indexes: IndexDef[] };

  for (const idx of indexes) {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/${idx.collectionGroup}/indexes`;
    const body = {
      queryScope: idx.queryScope,
      fields: idx.fields.map((f) => ({ fieldPath: f.fieldPath, order: f.order })),
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      if (json?.error?.status === "ALREADY_EXISTS") {
        console.log(`Already exists: ${idx.collectionGroup} ${idx.fields.map((f) => f.fieldPath).join(",")}`);
      } else {
        console.error(`Failed: ${idx.collectionGroup}`, JSON.stringify(json));
      }
    } else {
      console.log(`Created: ${idx.collectionGroup} ${idx.fields.map((f) => f.fieldPath).join(",")}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
