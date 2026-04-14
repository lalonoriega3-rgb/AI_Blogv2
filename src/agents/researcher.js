// src/agents/researcher.js
// Investiga el tema de AI más trending hoy usando Claude web_search

import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `Eres un investigador SEO especializado en inteligencia artificial.
Tu trabajo es encontrar el tema de AI más trending HOY en español, con potencial de posicionamiento SEO.

Busca en fuentes como:
- Noticias tech recientes (últimas 24-48h)
- Herramientas de AI que se están viralizando
- Modelos, actualizaciones o lanzamientos recientes
- Debates o controversias en la comunidad AI

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta (sin markdown, sin texto extra):
{
  "topic": "Tema principal en español (ej: GPT-5 de OpenAI ya disponible)",
  "keyword_principal": "keyword SEO principal en español",
  "keywords_secundarias": ["kw1", "kw2", "kw3", "kw4"],
  "angulo": "ángulo editorial único (ej: guía práctica, análisis crítico, comparativa)",
  "search_intent": "informational|navigational|transactional|commercial",
  "competencia_seo": "baja|media|alta",
  "razon": "por qué este tema es relevante ahora mismo"
}`;

export async function researchTopic() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  console.log("🔍 [Researcher] Buscando tema trending de AI...");

  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 3,
      },
    ],
    messages: [
      {
        role: "user",
        content: `Hoy es ${today}. Busca el tema de inteligencia artificial más trending hoy en español.
        Busca en noticias, blogs tech y redes sociales. Prioriza temas con baja o media competencia SEO pero alto volumen de búsqueda.
        Devuelve el JSON con el tema seleccionado.`,
      },
    ],
  });

  // Extrae el texto de la respuesta final
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("[Researcher] No se obtuvo respuesta de texto del modelo");
  }

  const rawText = textBlock.text.trim();

  // Parsea el JSON (limpia markdown si viene envuelto)
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`[Researcher] No se encontró JSON válido en: ${rawText.substring(0, 200)}`);
  }

  const research = JSON.parse(jsonMatch[0]);

  console.log(`✅ [Researcher] Tema: "${research.topic}"`);
  console.log(`   Keyword: "${research.keyword_principal}" (competencia: ${research.competencia_seo})`);

  return research;
}
