// src/agents/writer.js
// Escribe el artículo completo en MDX a partir del research JSON

import Anthropic from "@anthropic-ai/sdk";

function buildWriterPrompt(research) {
  const today = new Date().toISOString().split("T")[0];
  const { topic, keyword_principal, keywords_secundarias, angulo, search_intent } = research;

  return `Escribe un artículo completo en español sobre: "${topic}"

Ángulo editorial: ${angulo}
Keyword principal: "${keyword_principal}"
Keywords secundarias: ${keywords_secundarias.join(", ")}
Search intent: ${search_intent}
Fecha de publicación: ${today}

INSTRUCCIONES ESTRICTAS:

1. FRONTMATTER (exactamente este formato):
---
title: "Título atractivo con keyword principal (máx 60 chars)"
description: "Meta description con keyword, entre 150-160 caracteres exactos, que incite al clic"
date: "${today}"
tags: ["${keyword_principal}", "inteligencia artificial", "herramientas AI"]
keyword: "${keyword_principal}"
readTime: "X min"
---

2. CUERPO DEL ARTÍCULO (1200-1800 palabras):
- Primer párrafo: introduce el tema Y contiene la keyword principal de forma natural
- Usa H2 (##) y H3 (###) para estructurar — al menos un H2 debe contener la keyword
- Párrafos cortos (máx 4 líneas)
- Incluye al menos una lista con viñetas o numerada
- Incluye al menos un bloque de código o ejemplo si aplica
- Usa keywords secundarias de forma natural, sin stuffing
- Tono: experto pero accesible, directo, sin rodeos
- Termina con una conclusión accionable o call-to-action

3. FORMATO:
- Devuelve SOLO el MDX puro (frontmatter + cuerpo)
- Sin texto introductorio, sin explicaciones, sin markdown de código \`\`\`mdx
- El artículo debe leerse como escrito por un experto humano en AI
- PROHIBIDO usar clichés como: "En este artículo", "Sin duda", "En conclusión", "Es importante destacar"
- IMPORTANTE MDX: nunca uses los símbolos < o > fuera de bloques de código. En su lugar escribe "menor que", "mayor que", o usa paréntesis. Ej: "latencia menor a 2ms", "más del 10%"`;
}

export async function writeArticle(research) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  console.log("✍️  [Writer] Redactando artículo...");
  console.log(`   Tema: "${research.topic}"`);

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: buildWriterPrompt(research),
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("[Writer] No se obtuvo respuesta de texto");
  }

  let mdx = textBlock.text.trim();

  // Limpia envoltura de markdown si Claude la agrega
  mdx = mdx.replace(/^```(?:mdx|markdown)?\n/, "").replace(/\n```$/, "");

  // Verifica que tiene frontmatter
  if (!mdx.startsWith("---")) {
    throw new Error("[Writer] El MDX no tiene frontmatter válido");
  }

  const wordCount = mdx.split(/\s+/).length;
  console.log(`✅ [Writer] Artículo listo (~${wordCount} palabras)`);

  return mdx;
}
