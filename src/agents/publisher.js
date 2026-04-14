// src/agents/publisher.js
// Agente publicador — guarda MDX con imagen y sube a GitHub

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function toSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 80);
}

function extractTitle(mdx) {
  const match = mdx.match(/title:\s*["']?(.+?)["']?\s*\n/);
  return match ? match[1] : "post-sin-titulo";
}

/**
 * Inyecta el campo coverImage en el frontmatter del MDX
 */
function injectCoverImage(mdx, imagePath) {
  if (!imagePath) return mdx;
  // Inserta coverImage justo después de la primera línea del frontmatter ---
  return mdx.replace(
    /^(---\n)/,
    `$1coverImage: "${imagePath}"\n`
  );
}

function saveFile(mdx, slug) {
  const postsDir = path.join(process.cwd(), "src", "content", "posts");
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }
  const filePath = path.join(postsDir, `${slug}.mdx`);
  fs.writeFileSync(filePath, mdx, "utf-8");
  console.log(`💾 [Publisher] Guardado: ${filePath}`);
  return filePath;
}

function publishToGitHub(filePath, imagePath, slug) {
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
    console.log("⚠️  [Publisher] Sin GitHub credentials — solo local");
    return false;
  }

  try {
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    execSync(`git config user.email "agent@ai-blog.com"`);
    execSync(`git config user.name "AI Blog Agent"`);
    execSync(`git remote set-url origin https://${token}@github.com/${repo}.git`);

    execSync(`git add "${filePath}"`);

    // También agrega la imagen si existe
    if (imagePath) {
      const fullImagePath = path.join(process.cwd(), "public", imagePath);
      if (fs.existsSync(fullImagePath)) {
        execSync(`git add "${fullImagePath}"`);
      }
    }

    execSync(`git commit -m "post: ${slug} [auto]"`);
    execSync("git push origin main");

    console.log("🚀 [Publisher] Publicado en GitHub → Vercel desplegará");
    return true;
  } catch (error) {
    console.error("[Publisher] Error GitHub:", error.message);
    return false;
  }
}

export async function publishArticle(mdx, imagePath = null) {
  console.log("📤 [Publisher] Preparando publicación...");

  const title = extractTitle(mdx);
  const slug = toSlug(title);

  // Inyecta la imagen en el frontmatter
  const finalMdx = injectCoverImage(mdx, imagePath);

  const filePath = saveFile(finalMdx, slug);
  const published = publishToGitHub(filePath, imagePath, slug);

  console.log(`✅ [Publisher] "${title}"`);
  return {
    slug,
    filePath,
    published,
    title,
    imagePath,
    url: published ? `${process.env.BLOG_URL}/blog/${slug}` : null,
  };
}
