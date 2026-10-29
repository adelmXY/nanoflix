import { readFileSync } from "node:fs";
import { catalogSchema } from "../src/features/catalog";
const result = catalogSchema.safeParse(
  JSON.parse(
    readFileSync(
      new URL("../public/data/catalog.json", import.meta.url),
      "utf8",
    ),
  ),
);
if (!result.success) {
  console.error(
    result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n"),
  );
  process.exitCode = 1;
} else
  console.log(
    `Catalogo valido: ${result.data.titles.length} titoli, ${result.data.titles.flatMap((t) => t.seasons.flatMap((s) => s.episodes)).length} episodi.`,
  );
