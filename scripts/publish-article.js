// scripts/publish-article.js
// Publica un artículo proporcionado por el usuario: formatea MDX → imagen → despliega

import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { generateCoverImage } from "../src/agents/imageAgent.js";
import { publishArticle } from "../src/agents/publisher.js";

dotenv.config({ path: ".env.local" });

async function readArticleContent() {
  const filePath = process.argv[2];

  if (filePath) {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Archivo no encontrado: ${filePath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, "utf-8").trim();
    if (!content) {
      console.error("❌ El archivo está vacío");
      process.exit(1);
    }
    console.log(`   Leyendo desde archivo: ${filePath}`);
    return content;
  }

  if (!process.stdin.isTTY) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      process.stdin.setEncoding("utf-8");
      process.stdin.on("data", (chunk) => chunks.push(chunk));
      process.stdin.on("end", () => {
        const content = chunks.join("").trim();
        if (!content) reject(new Error("stdin está vacío"));
        else resolve(content);
      });
      process.stdin.on("error", reject);
    });
  }

  console.error("Uso:");
  console.error("  node scripts/publish-article.js articulo.txt");
  console.error("  node scripts/publish-article.js articulo.md");
  console.error("  cat articulo.txt | node scripts/publish-article.js");
  process.exit(1);
}

async function formatArticleAsMDX(rawContent) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const today = new Date().toISOString().split("T")[0];

  const prompt = `Eres un editor MDX experto para un blog de IA en español.
El usuario te proporciona un artículo en forma bruta. Tu tarea:

1. ANALIZA el contenido e infiere o extrae:
   - title: Título atractivo con keyword (máx 60 caracteres)
   - description: Meta description 150-160 chars con keyword y gancho de clic
   - date: "${today}"
   - tags: Array de 3 strings (primer tag = keyword principal)
   - keyword: La keyword SEO más importante del artículo (en español)
   - readTime: "X min" (palabras ÷ 200, redondea arriba)

2. FORMATEA el cuerpo como MDX válido:
   - Elimina cualquier frontmatter existente (bloques entre ---)
   - Sin encabezados H1 (#) — solo ## y ### en adelante
   - CRÍTICO: reemplaza < y > fuera de bloques de código con palabras o reestructura la frase
   - Mantén todos los bloques de código intactos
   - Párrafos máximo 4 líneas
   - Elimina clichés: "Sin duda", "Es importante destacar", "En este artículo", "En conclusión"
   - Preserva la voz y el contenido del usuario — NO reescribas ni expandas

3. FORMATO DE SALIDA — devuelve SOLO esto, sin nada más:
---
title: "..."
description: "..."
date: "${today}"
tags: ["...", "...", "..."]
keyword: "..."
readTime: "... min"
---

[cuerpo del artículo formateado]

Sin bloques \`\`\`mdx, sin explicaciones antes ni después. El frontmatter debe empezar en la línea 1.

ARTÍCULO DEL USUARIO:
${rawContent}`;

  console.log("   Llamando a Claude para formatear...");

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("[Formatter] No se obtuvo respuesta de texto de Claude");
  }

  let mdx = textBlock.text.trim();

  // Limpia envoltura de markdown si Claude la agrega
  mdx = mdx.replace(/^```(?:mdx|markdown)?\n/, "").replace(/\n```$/, "");

  if (!mdx.startsWith("---")) {
    throw new Error("[Formatter] El MDX no tiene frontmatter válido");
  }

  // Deduplica claves en el frontmatter (Claude a veces repite campos)
  mdx = mdx.replace(/^(---\n)([\s\S]*?)(---)/m, (_, open, body, close) => {
    const seen = new Set();
    const deduped = body.split("\n").filter((line) => {
      const key = line.match(/^(\w+):/)?.[1];
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).join("\n");
    return `${open}${deduped}${close}`;
  });

  return mdx;
}

async function publishUserArticle() {
  const startTime = Date.now();
  console.log("\n📝 ════════════════════════════════════════════");
  console.log("   AI Blog — Publicar artículo del usuario");
  console.log("════════════════════════════════════════════\n");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ Falta ANTHROPIC_API_KEY en .env.local");
    process.exit(1);
  }

  try {
    // ── Paso 1: Leer contenido ─────────────────────────
    console.log("Paso 1/4 — Leyendo artículo\n");
    const rawContent = await readArticleContent();
    const wordCount = rawContent.split(/\s+/).length;
    console.log(`   ${wordCount} palabras detectadas`);

    // ── Paso 2: Formatear como MDX ─────────────────────
    console.log("\nPaso 2/4 — Formateando como MDX (Claude)\n");
    const formattedMdx = await formatArticleAsMDX(rawContent);
    console.log("✅ [Formatter] MDX listo con frontmatter válido");

    // ── Paso 3: Imagen de portada ──────────────────────
    console.log("\nPaso 3/4 — Generando imagen de portada (Replicate)\n");
    const tempTitle =
      formattedMdx.match(/title:\s*["']?(.+?)["']?\s*\n/)?.[1] || "post";
    const tempSlug = tempTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .substring(0, 80);

    const keyword =
      formattedMdx.match(/keyword:\s*["']?(.+?)["']?\s*\n/)?.[1] || tempTitle;
    const research = { topic: tempTitle, keyword_principal: keyword };

    let imagePath = null;
    try {
      imagePath = await generateCoverImage(research, tempSlug);
    } catch (imgError) {
      console.warn(
        "⚠️  [Pipeline] imageAgent falló, continuando sin imagen:",
        imgError.message
      );
    }

    // ── Paso 4: Publicar ───────────────────────────────
    console.log("\nPaso 4/4 — Publicando en GitHub\n");
    const result = await publishArticle(formattedMdx, imagePath);

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log("\n🎉 ════════════════════════════════════════════");
    console.log("   ¡Artículo publicado!");
    console.log(`   Tiempo: ${elapsed}s`);
    console.log(`   Post: "${result.title}"`);
    if (imagePath) console.log(`   Imagen: ${imagePath}`);
    if (result.url) console.log(`   URL: ${result.url}`);
    console.log("════════════════════════════════════════════\n");

    return result;
  } catch (error) {
    console.error("\n❌ Falló:", error.message);
    if (process.env.DEBUG) console.error(error.stack);
    process.exit(1);
  }
}

publishUserArticle();
