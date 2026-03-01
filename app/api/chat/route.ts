import { NextResponse } from "next/server";
import Groq from 'groq-sdk'
import { supabaseAdmin } from "@/lib/supabase/admin";


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

// System Prompt de PHENIX
// Ce prompt définit la personnalité et les règles de l'IA PHENIX
const SYSTEM_PROMPT = `Tu es "Phénix", l'assistant IA contextuel et pédagogique d'élite de PHENIX, une plateforme conçu pour les étudiants et chercheurs des universités du Bénin.

MISSION : Ta seule mission est d'aider les étudiants à réussir en utilisant le patrimoine scientifique local. Tu dois en outre :
- Aider les étudiants avec leurs recherches académiques
- Répondre aux questions en t'appuyant sur le contexte local (universités béninoises, mémoires, thèses)
- Fournir des réponses précises, citées quand possible
- Communiquer de manière professionnelle mais accessible

MÉTHODOLOGIE OBLIGATOIRE EN 4 ÉTAPES : 
1. CONTEXTUALISATION : Définis les termes clés et l'enjeu du sujet.
2. ANALYSE VIA DES MÉMOIRES : Si des extraits sont dans le contexte, cite-les avec le format [Auteur, École, Année][N].
Compare les approches si plusieurs sources existent.
3. SYNTHÈSE STRUCTURÉE : Utilise des titres Markdown clairs (##, ###). 
Ton formel, précis, didactique, honnête.
4. OUVERTURE : Si le sujet est couvert localement, propose de contacter l'auteur.
Si AUCUN mémoire local n'existe, connclus par: "Désolé, aucun mémoire de l'UAC ou d'une autre université du Bénin n'a encore approfondi ce sujet. Mais tiens ! C'est une opprtunité pour toi d'être la première personne à traiter de ce sujet. Cela impactera fortement le patrimoine local des Universités du Bénin."
RÈGLES ANTI-DISTRACTION : 
Refuse poliment les sujets hors académiques (sport, divertissement, politique, jeu, ciméma)
Exemple : "Je préfère qu'on se concentre sur tes cours et recherches académiques plutôt que sur le foot !" 

LANGUE : Réponds toujours en FRANÇAIS. Utilise le Markdown pour le mise en forme.`


export async function POST(req: Request){
try {
const body = await req.json()

// Support both formats: { question } or { messages }
let question: string
if (body.question) {
  question = body.question
} else if (body.messages?.length > 0) {
  // Extract the last user message from the messages array
  const lastUserMsg = [...body.messages].reverse().find((m: { role: string }) => m.role === 'user')
  question = lastUserMsg?.content || ''
} else {
  question = ''
}

if (!question?.trim())
return NextResponse.json({ error: 'Question requise' }, { status: 400 })

// 1. Vectorisation de la question
const { pipeline } = await import('@xenova/transformers')
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
const out = await embedder(question, { pooling: 'mean', normalize: true })
const qVector = Array.from(out.data)

// 2. Recherche des 5 chunks les plus proches dans supabase 
const { data: chuncks } = await supabaseAdmin.rpc('match_document_chunks', {
query_embedding: qVector,
match_threshold: 0.3,
match_count: 5,
})

// 3. Construction du contexte pour l'IA 
let context = ''
const sources: unknown[] = []
interface MemoryChunk {
doc_title: string;
doc_author: string;
doc_school: string;
doc_year: string | number;
content: string;
document_id: string;
}

if (chuncks?.length > 0) {
context = '\n--- EXTRAITS DE MÉMOIRES LOCAUX ---\n'
chuncks.forEach((c: MemoryChunk, i:number) => {
context += `[${i + 1}] "${c.doc_title}" — ${c.doc_author} (${c.doc_school}, ${c.doc_year})\n"${c.content}"\n\n`
sources.push({
index: i + 1, 
title: c.doc_title, 
author: c.doc_author,
school: c.doc_school, 
year: c.doc_year, 
document_id: c.document_id
})
})
}

// 4. Appel de Groq en streaming
try {
const completion = await groq.chat.completions.create({
model: 'llama3-70b-8192',
max_completion_tokens: 2048,
temperature: 0.3,
stream: true,
messages: [
  { role: 'system', content: SYSTEM_PROMPT },
  { role: 'user', content: context + `\nQuestion : ${question}` }
],
})

// Return SSE stream
const encoder = new TextEncoder()
const stream = new ReadableStream({
async start(controller) {
  try {
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
      }
    }
    // Send sources at the end
    if (sources.length > 0) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`))
    }
    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
    controller.close()
  } catch (streamErr) {
    console.error('[CHAT] Stream error:', streamErr)
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: 'Erreur pendant la génération.' })}\n\n`))
    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
    controller.close()
  }
}
})

return new Response(stream, {
headers: {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
},
})
}
catch (groqErr) {
// Fallback Gemini (stratégie Hydra)
console.warn('[CHAT] Groq failed -> Gemini fallback', groqErr)
const r = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\n' + context + `\nQuestion: ${question}` }] }]
    })
  }
)
const gData = await r.json()
const answer = gData?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Service temporairement indisponible.'

// Return SSE stream for Gemini fallback too
const encoder = new TextEncoder()
const stream = new ReadableStream({
start(controller) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: answer })}\n\n`))
  if (sources.length > 0) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`))
  }
  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
  controller.close()
}
})

return new Response(stream, {
headers: {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
},
})
}
}
catch (err: unknown) {
const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
console.error('[CHAT]', errorMessage)
return NextResponse.json({ error: 'Erreur interne' }, {status: 500})
}
}