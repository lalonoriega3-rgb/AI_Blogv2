// src/agents/imageAgent.js
// Agente de imágenes — genera portadas con Replicate + nanobanana

import Replicate from "replicate";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

/**
 * Construye un prompt visual para nanobanana basado en el tema del artículo.
 * nanobanana es excelente para imágenes editorial/tech con estética limpia.
 */
function buildImagePrompt(research) {
  const topic = research.topic;
  const keyword = research.keyword_principal;

  return `editorial tech magazine cover illustration for article about "${topic}",
  ${keyword}, clean minimal design, flat geometric shapes, bold typography composition,
  deep navy and electric cyan color palette, professional digital art,
  no text, no letters, abstract technology concept, high contrast,
  modern graphic design aesthetic, 16:9 aspect ratio`;
}

/**
 * Descarga una imagen desde una URL y la guarda en disco
 */
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destPath);

    protocol
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(destPath);
        });
      })
      .on("error", (err) => {
        fs.unlink(destPath, () => {}); // limpia archivo parcial
        reject(err);
      });
  });
}

/**
 * Genera la imagen de portada del post con Replicate + nanobanana
 */
export async function generateCoverImage(research, slug) {
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  console.log("🎨 [Imágenes] Generando portada con nanobanana...");

  if (!process.env.REPLICATE_API_TOKEN) {
    console.warn("⚠️  [Imágenes] Sin REPLICATE_API_TOKEN — saltando generación");
    return null;
  }

  const prompt = buildImagePrompt(research);
  console.log(`   Prompt: "${prompt.substring(0, 80)}..."`);

  try {
    // FLUX Schnell — rápido (~5s), alta calidad editorial, gratuito en Replicate
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt,
          width: 1280,
          height: 720,
          num_outputs: 1,
          output_format: "jpg",
          output_quality: 90,
        },
      }
    );

    // Replicate devuelve una URL o un ReadableStream
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl) {
      throw new Error("Replicate no devolvió una imagen");
    }

    // Guarda la imagen en public/images/posts/
    const imagesDir = path.join(process.cwd(), "public", "images", "posts");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const imagePath = path.join(imagesDir, `${slug}.jpg`);
    const imagePublicPath = `/images/posts/${slug}.jpg`;

    // Si es URL, descarga; si es stream, lee
    if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
      await downloadImage(imageUrl, imagePath);
    } else {
      // ReadableStream de Replicate
      const chunks = [];
      for await (const chunk of imageUrl) {
        chunks.push(chunk);
      }
      fs.writeFileSync(imagePath, Buffer.concat(chunks));
    }

    console.log(`✅ [Imágenes] Portada guardada: ${imagePublicPath}`);
    return imagePublicPath;
  } catch (error) {
    console.error("[Imágenes] Error generando imagen:", error.message);
    // No falla el pipeline completo — solo continúa sin imagen
    return null;
  }
}
