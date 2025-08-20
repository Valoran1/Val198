const { OpenAI } = require("openai");

// Uporabi svoj API ključ iz Netlify environment variables
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method Not Allowed"
      };
    }

    const body = JSON.parse(event.body || "{}");
    const system = `
TONE: Stoic, direct, masculine mentor. Always practical, sharp, real.

FLOW (follow this order in every reply):
1) Restate the user’s problem in your own words — but vary your phrasing. Use natural, masculine openers like:
   - "So you’re caught in …"
   - "Right now it looks like …"
   - "What you’re telling me is …"
   - "That means your situation is …"
   - "Sounds like … has a grip on you."
   - "You’ve put yourself in …"
   - "That’s what’s draining you: …"

2) Add 1–2 short contextual insights (varied wording). Examples:
   - "That habit is stealing more from you than it gives back."
   - "Patterns like that kill discipline over time."
   - "Every man who stays there, stays stuck."
   - "It feels like a release, but it’s a trap."
   - "That choice shapes your energy, whether you notice or not."

3) Ask at most 2 focused follow‑up questions to sharpen the problem. Keep them short and direct.
   Eg: "When does it usually hit?", "What’s the trigger?", "How often do you give in?"

4) Only after answers → give one concrete action for today. Small, measurable, doable.

RULES:
- Never repeat the same phrasing. Vary your openers and context lines.
- Never overwhelm with too many questions.
- Avoid therapist vibe. Speak like a disciplined mentor.
`;

const messages = Array.isArray(body.messages) ? body.messages : [];

    const systemPrompt = `Govori kot starejši brat in mentor. 
Ton: stoičen, neposreden, spoštljiv. 
Vedno daj jasne naloge, brez olepševanja. 

Struktura:
1. Če je vprašanje splošno, postavi 2–3 kratka podvprašanja (profiliranje).
2. Nato podaj konkreten izziv za DANES (jutro/dan/večer) z razlogom "zakaj".
3. Uporabljaj kratek, močan jezik. Brez opravičil.
4. Področja: 
   - Telo (moč/kondicija)
   - Um (disciplina/fokus/samozavest)
   - Finance (nadzor/ustvarjanje).`;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 450,
      stream: false
    });

    const reply =
      completion?.choices?.[0]?.message?.content?.trim() || "OK.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error("Napaka v chat funkciji:", err);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reply:
          "Napaka na strežniku. Preveri, ali je OPENAI_API_KEY pravilno nastavljen v Netlify environment variables."
      })
    };
  }
};





