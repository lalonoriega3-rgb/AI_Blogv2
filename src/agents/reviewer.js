// src/agents/reviewer.js
// Revisa el MDX para SEO y calidad, agrega reviewScore al frontmatter

import Anthropic from "@anthropic-ai/sdk";

function buildReviewerPrompt(mdx, research) {
  const { keyword_principal } = research;

  return `Eres un editor SEO experto. Revisa y mejora este artículo MDX.

KEYWORD PRINCIPAL: "${keyword_principal}"

CRITERIOS DE REVISIÓN (verifica y corrige cada uno):

1. ✅ KEYWORD EN PRIMER PÁRRAFO — la keyword debe aparecer de forma natural en el primer párrafo del cuerpo
2. ✅ KEYWORD EN AL MENOS UN H2 — al menos un encabezado ## debe contener la keyword o una variante cercana
3. ✅ META DESCRIPTION — debe tener entre 150-160 caracteres exactos (cuenta los caracteres, ajusta si es necesario)
4. ✅ PÁRRAFOS CORTOS — ningún párrafo debe superar 4 líneas. Divide los largos
5. ✅ SIN CLICHÉS — elimina frases como "Sin duda", "Es importante destacar", "En este artículo", "En conclusión", "Cabe mencionar"
6. ✅ DENSIDAD DE KEYWORD — la keyword principal debe aparecer 3-5 veces en total (ni más, ni menos)
7. ✅ TÍTULO SEO — el title del frontmatter debe tener máximo 60 caracteres

DESPUÉS DE LA REVISIÓN:
- Agrega al frontmatter el campo: reviewScore: XX/100 (calcula el score basado en cuántos criterios cumplía el original)
- El score refleja la calidad ANTES de tus correcciones

FORMATO DE RESPUESTA:
- Devuelve SOLO el MDX mejorado (frontmatter completo + cuerpo completo)
- Sin explicaciones, sin texto antes o después del MDX
- Sin envoltura \`\`\`mdx

ARTÍCULO A REVISAR:
${mdx}`;
}

export async function reviewArticle(mdx, research) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  console.log("🔎 [Reviewer] Revisando SEO y calidad...");

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: buildReviewerPrompt(mdx, research),
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("[Reviewer] No se obtuvo respuesta de texto");
  }

  let reviewed = textBlock.text.trim();

  // Limpia envoltura markdown si existe
  reviewed = reviewed.replace(/^```(?:mdx|markdown)?\n/, "").replace(/\n```$/, "");

  // Verifica frontmatter
  if (!reviewed.startsWith("---")) {
    throw new Error("[Reviewer] El MDX revisado no tiene frontmatter válido");
  }

  // Extrae el reviewScore para logearlo
  const scoreMatch = reviewed.match(/reviewScore:\s*(\d+)\/100/);
  const score = scoreMatch ? scoreMatch[1] : "?";
  console.log(`✅ [Reviewer] Revisión completa — Score original: ${score}/100`);

  return reviewed;
}
