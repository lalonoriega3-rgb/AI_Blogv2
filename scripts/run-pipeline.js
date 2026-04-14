// scripts/run-pipeline.js
// Pipeline completo: investigar → escribir → revisar → imagen → publicar

import { researchTopic } from "../src/agents/researcher.js";
import { writeArticle } from "../src/agents/writer.js";
import { reviewArticle } from "../src/agents/reviewer.js";
import { generateCoverImage } from "../src/agents/imageAgent.js";
import { publishArticle } from "../src/agents/publisher.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function runPipeline() {
  const startTime = Date.now();
  console.log("\n🤖 ════════════════════════════════════════════");
  console.log("   AI Blog Agent — Pipeline completo");
  console.log("════════════════════════════════════════════\n");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ Falta ANTHROPIC_API_KEY en .env.local");
    process.exit(1);
  }

  try {
    // ── Paso 1: Investigación ──────────────────────────
    console.log("Paso 1/5 — Investigación\n");
    const research = await researchTopic();

    // ── Paso 2: Redacción ──────────────────────────────
    console.log("\nPaso 2/5 — Redacción\n");
    const draft = await writeArticle(research);

    // ── Paso 3: Revisión SEO ───────────────────────────
    console.log("\nPaso 3/5 — Revisión SEO\n");
    const finalMdx = await reviewArticle(draft, research);

    // ── Paso 4: Imagen (opcional) ──────────────────────
    console.log("\nPaso 4/5 — Generación de imagen (Replicate)\n");
    // Extrae el slug antes de publicar para nombrar la imagen
    const tempTitle = finalMdx.match(/title:\s*["']?(.+?)["']?\s*\n/)?.[1] || "post";
    const tempSlug = tempTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .substring(0, 80);

    let imagePath = null;
    try {
      imagePath = await generateCoverImage(research, tempSlug);
    } catch (imgError) {
      console.warn("⚠️  [Pipeline] imageAgent falló, continuando sin imagen:", imgError.message);
    }

    // ── Paso 5: Publicación ────────────────────────────
    console.log("\nPaso 5/5 — Publicación\n");
    const result = await publishArticle(finalMdx, imagePath);

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log("\n🎉 ════════════════════════════════════════════");
    console.log("   ¡Pipeline completado!");
    console.log(`   Tiempo: ${elapsed}s`);
    console.log(`   Post: "${result.title}"`);
    if (imagePath) console.log(`   Imagen: ${imagePath}`);
    if (result.url)  console.log(`   URL: ${result.url}`);
    console.log("════════════════════════════════════════════\n");

    return result;
  } catch (error) {
    console.error("\n❌ Pipeline falló:", error.message);
    if (process.env.DEBUG) console.error(error.stack);
    process.exit(1);
  }
}

runPipeline();
