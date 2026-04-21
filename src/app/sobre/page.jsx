// src/app/sobre/page.jsx

export const metadata = {
  title: "Acerca",
  description: "Conoce más sobre AIHub, el blog de inteligencia artificial en español.",
};

export default function SobrePage() {
  return (
    <main>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "4rem var(--gutter) 6rem" }}>
        <div className="section-label">Acerca de</div>

        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, lineHeight: 1.1, color: "var(--text)", margin: "1.5rem 0 2rem" }}>
          <em>Inteligencia artificial,<br />explicada en español</em>
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", color: "var(--text2)", lineHeight: 1.8, fontSize: "1.05rem" }}>
          <p>
            <strong style={{ color: "var(--text)" }}>AIHub</strong> es un blog dedicado a cubrir el mundo de la inteligencia artificial con claridad y profundidad, en español.
          </p>
          <p>
            Publicamos análisis, guías y noticias sobre las últimas herramientas, modelos y tendencias en IA — desde ChatGPT y Claude hasta aplicaciones empresariales y regulación global.
          </p>
          <p>
            Nuestro pipeline editorial está automatizado con agentes de Claude AI, lo que nos permite publicar contenido de calidad de forma consistente y eficiente.
          </p>
          <p>
            Si tienes preguntas o quieres colaborar, puedes escribirnos directamente.
          </p>
        </div>
      </div>
    </main>
  );
}
