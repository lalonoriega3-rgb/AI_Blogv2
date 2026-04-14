// src/lib/posts.js
// Lee y parsea los archivos MDX de src/content/posts/

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

/**
 * Lee todos los posts y devuelve sus metadatos (sin el contenido completo)
 * Ordenados del más reciente al más antiguo
 */
export async function getAllPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.(mdx|md)$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf-8");
    const { data } = matter(raw);

    return {
      slug,
      title: data.title || slug,
      description: data.description || "",
      date: data.date || "",
      tags: data.tags || [],
      readTime: data.readTime || "",
      coverImage: data.coverImage || null,
      keyword: data.keyword || "",
    };
  });

  // Ordena por fecha descendente
  return posts.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });
}

/**
 * Lee un post específico por slug, incluyendo el contenido MDX
 */
export async function getPostBySlug(slug) {
  const extensions = [".mdx", ".md"];

  for (const ext of extensions) {
    const filePath = path.join(POSTS_DIR, `${slug}${ext}`);
    if (!fs.existsSync(filePath)) continue;

    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return {
      slug,
      title: data.title || slug,
      description: data.description || "",
      date: data.date || "",
      tags: data.tags || [],
      readTime: data.readTime || "",
      coverImage: data.coverImage || null,
      keyword: data.keyword || "",
      content,
    };
  }

  return null;
}
