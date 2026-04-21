// src/app/blog/[slug]/page.jsx
import { notFound } from "next/navigation";
import { AdSidebar, AdNative } from "../../components/AdSlot";
import { getPostBySlug, getAllPosts } from "../../../lib/posts";
import { compileMDX } from "next-mdx-remote/rsc";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function PostPage({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const allPosts = await getAllPosts();
  const related = allPosts
    .filter((p) => p.slug !== params.slug)
    .slice(0, 4);

  // Escapa "<" seguido de dígito o espacio — MDX los confunde con JSX inválido
  // Ej: "<2ms", "< 10%", "<3 años" → "&lt;2ms", etc.
  // No toca etiquetas JSX válidas como <Component> ni bloques de código.
  const sanitized = post.content.replace(/<(\d|\s)/g, "&lt;$1");

  // Compila el MDX a React
  const { content } = await compileMDX({
    source: sanitized,
    options: { parseFrontmatter: false },
  });

  return (
    <>
      <div className="post-layout">
        {/* ── Contenido principal ── */}
        <article>
          {/* Cover image */}
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="post-cover"
            />
          )}

          {/* Header */}
          <header className="post-header fade-up fade-up-1">
            {post.tags?.length > 0 && (
              <div className="tag-list">
                {post.tags.map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            )}
            <h1 className="post-title">{post.title}</h1>
            {post.description && (
              <p className="post-description">{post.description}</p>
            )}
            <div className="post-meta-row">
              <span>{post.date}</span>
              {post.readTime && <span>{post.readTime} de lectura</span>}
            </div>
          </header>

          {/* Ad nativo dentro del artículo */}
          <AdNative zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_NATIVE} />

          {/* Cuerpo del artículo */}
          <div className="post-body fade-up fade-up-2">
            {content}
          </div>
        </article>

        {/* ── Sidebar ── */}
        <aside className="post-sidebar fade-up fade-up-3">
          {/* Ad 300x250 */}
          <AdSidebar zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SIDEBAR} />

          {/* Posts relacionados */}
          {related.length > 0 && (
            <div className="sidebar-related">
              <div className="sidebar-related-title">También te puede interesar</div>
              {related.map((r) => (
                <a key={r.slug} href={`/blog/${r.slug}`} className="related-item">
                  {r.title}
                </a>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
