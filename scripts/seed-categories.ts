import "dotenv/config";
import { seedCategoriesIfEmpty } from "@/lib/repositories/categories";

seedCategoriesIfEmpty()
  .then(() => {
    console.log("Categories seeded (or already present).");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
