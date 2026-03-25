export default async function handler(req, res) {
// Only allow POST
if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

const { businessType, challenge } = req.body;

if (!businessType || !challenge) {
return res.status(400).json({ error: ‘Missing businessType or challenge’ });
}

const FALLBACK = {
message: “Yeah, that’s one of the most common things we hear!\n\nAn AI agent can handle this automatically — trained on your business, running 24/7.\n\nMost clients free up hours every week within the first month.”,
statNum: “4 hrs”,
statLabel: “saved per week”,
statSub: “on average for similar businesses”
};

try {
const apiKey = process.env.GEMINI_API_KEY;
const model  = ‘gemini-2.0-flash’;
const url    = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

```
const prompt = `You are a friendly local AI consultant from Hastings chatting casually with a small business owner.
```

Respond ONLY with a valid JSON object — no markdown, no code fences, nothing else. Format:
{“message”: “…”, “statNum”: “…”, “statLabel”: “…”, “statSub”: “…”}

message: EXACTLY 3 very short sentences, each separated by \n\n.

- Sentence 1: Start with “Oh,” or “Yeah,” or “Honestly,” — empathise warmly. Max 15 words.
- Sentence 2: ONE specific AI agent that solves their exact problem. Concrete and real. Max 20 words.
- Sentence 3: The upbeat result — time saved, money made, stress gone. Max 15 words.
  statNum: A punchy time/money stat relevant to this business + challenge (e.g. “4 hrs”, “£200”, “3 hrs”, “6 hrs”). Keep it realistic and specific.
  statLabel: 3–5 word label for the stat (e.g. “saved on admin weekly”, “recovered in missed leads”).
  statSub: One short supporting phrase (e.g. “on average, per week” or “per month for similar businesses”).

Sound like a friendly local expert. No jargon. No waffle.

Business type: ${businessType}
Biggest challenge: ${challenge}

Respond with the JSON object only.`;

```
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 300,
      temperature: 0.7
    }
  })
});

if (!response.ok) {
  throw new Error(`Gemini API error: ${response.status}`);
}

const data = await response.json();

// Extract text from Gemini response structure
const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

// Strip any accidental markdown fences just in case
const cleaned = rawText.replace(/```json|```/g, '').trim();

let parsed;
try {
  parsed = JSON.parse(cleaned);
} catch {
  parsed = FALLBACK;
}

return res.status(200).json(parsed);
```

} catch (error) {
console.error(‘Chat API error:’, error);
return res.status(500).json(FALLBACK);
}
}