// src/app/blog/page.jsx
import Link from "next/link";
import { getAllPosts } from "../../lib/posts";

export const metadata = {
  title: "Artículos",
  description: "Todos los artículos sobre inteligencia artificial en español.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <main>
      <div style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "3rem var(--gutter) 5rem" }}>
        <div className="section-label">Todos los artículos</div>

        {posts.length === 0 && (
          <p style={{ color: "var(--text2)", marginTop: "3rem" }}>No hay artículos publicados todavía.</p>
        )}

        <div className="posts-grid">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`post-card fade-up fade-up-${Math.min(i + 1, 4)}`}
            >
              <div className="post-card-image">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} loading="lazy" />
                ) : (
                  <div className="post-card-image-placeholder" />
                )}
              </div>
              <div className="post-card-body">
                {post.tags?.[0] && (
                  <div className="post-card-tag">{post.tags[0]}</div>
                )}
                <h2 className="post-card-title">{post.title}</h2>
                <div className="post-card-meta">
                  <span>{post.date}</span>
                  {post.readTime && <span>{post.readTime}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
