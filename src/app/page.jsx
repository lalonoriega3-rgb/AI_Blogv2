// src/app/page.jsx
import Link from "next/link";
import { AdBanner } from "./components/AdSlot";
import { getAllPosts } from "../lib/posts";

export default async function HomePage() {
  const posts = await getAllPosts();
  const featured = posts[0];
  const rest = posts.slice(1, 7);

  return (
    <>
      {/* ── Header ad (728x90) ── */}
      <div className="ad-header">
        <AdBanner zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_HEADER} />
      </div>

      {/* ── Hero — featured post ── */}
      {featured && (
        <section className="hero">
          <div className="fade-up fade-up-1">
            <div className="hero-eyebrow">Artículo destacado</div>
            <h1 className="hero-title">
              <em>{featured.title}</em>
            </h1>
            <p className="hero-sub">{featured.description}</p>
            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", alignItems: "center" }}>
              <Link
                href={`/blog/${featured.slug}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--accent)",
                  color: "var(--bg)",
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "12px 22px",
                  borderRadius: 2,
                  transition: "opacity .15s",
                }}
              >
                Leer artículo →
              </Link>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>
                {featured.readTime}
              </span>
            </div>
          </div>

          {featured.coverImage && (
            <div className="hero-image fade-up fade-up-2">
              <img src={featured.coverImage} alt={featured.title} />
            </div>
          )}
        </section>
      )}

      {!featured && (
        <section style={{ maxWidth: "var(--max)", margin: "0 auto", padding: "8rem var(--gutter)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1rem" }}>
            Blog en construcción
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 400, color: "var(--text)", marginBottom: "1.5rem" }}>
            <em>Próximamente: artículos sobre AI</em>
          </h1>
          <p style={{ color: "var(--text2)", maxWidth: 480, margin: "0 auto" }}>
            El pipeline automatizado publicará el primer artículo pronto. Configura tus variables de entorno y ejecuta <code style={{ fontFamily: "var(--mono)", background: "var(--bg3)", padding: "2px 6px", color: "var(--accent)" }}>npm run pipeline</code>.
          </p>
        </section>
      )}

      {/* ── Posts grid ── */}
      {rest.length > 0 && (
        <section className="posts-section">
          <div className="section-label">Últimos artículos</div>
          <div className="posts-grid">
            {rest.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`post-card fade-up fade-up-${Math.min(i + 1, 4)}`}
              >
                <div className="post-card-image">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} loading="lazy" />
                  ) : (
                    <div className="post-card-image-placeholder">
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <rect width="40" height="40" rx="4" fill="#2a2a2a"/>
                        <path d="M8 28l8-10 6 7 4-5 6 8H8z" fill="#3a3a3a"/>
                        <circle cx="27" cy="14" r="4" fill="#3a3a3a"/>
                      </svg>
                    </div>
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
        </section>
      )}

      {/* ── Mid-page ad ── */}
      <AdBanner zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_MID} />

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "2rem var(--gutter)" }}>
        <div style={{ maxWidth: "var(--max)", margin: "0 auto", display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>
          <span>AIToolsHub — Automatizado con Claude AI</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </>
  );
}
