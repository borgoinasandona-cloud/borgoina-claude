/**
 * Carica su Cloudinary tutte le immagini in materiale/Immagini-sito e salva la mappatura
 * path locale -> public_id/secure_url in scripts/cloudinary-import-results.json, da usare
 * come riferimento quando si creano le Page/Post nel CMS.
 *
 * Non viene eseguito automaticamente: richiede CLOUDINARY_* valorizzate in .env.
 * Uso: npm run cloudinary:import
 */
import "dotenv/config";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SOURCE_DIR = path.resolve(process.cwd(), "materiale/Immagini-sito");
const CLOUDINARY_FOLDER = "borgoina/import";
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function collectImageFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectImageFiles(fullPath)));
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.error("Variabili CLOUDINARY_* non configurate in .env — interrompo.");
    process.exit(1);
  }

  const files = await collectImageFiles(SOURCE_DIR);
  console.log(`Trovate ${files.length} immagini in ${SOURCE_DIR}`);

  const results: { localPath: string; publicId: string; secureUrl: string }[] = [];

  for (const file of files) {
    const relativePath = path.relative(SOURCE_DIR, file);
    process.stdout.write(`Carico ${relativePath}... `);
    try {
      const folder = path
        .join(CLOUDINARY_FOLDER, path.dirname(relativePath))
        .split(path.sep)
        .join("/");
      const upload = await cloudinary.uploader.upload(file, { folder });
      results.push({ localPath: relativePath, publicId: upload.public_id, secureUrl: upload.secure_url });
      console.log("OK");
    } catch (error) {
      console.log("ERRORE");
      console.error(error);
    }
  }

  const outputPath = path.resolve(process.cwd(), "scripts/cloudinary-import-results.json");
  await writeFile(outputPath, JSON.stringify(results, null, 2));
  console.log(`Fatto. Mappatura salvata in ${outputPath}`);
}

main();
