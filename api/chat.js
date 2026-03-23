// /api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { businessType, challenge } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, 
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Using Haiku for speed/lower cost
        max_tokens: 250,
        system: `You are a friendly local AI consultant from Hastings, East Sussex.
                 Respond ONLY with a valid JSON object. 
                 Structure: {"message": "3 short sentences with \\n\\n breaks", "statNum": "e.g. 4 hrs", "statLabel": "e.g. saved per week", "statSub": "short context"}`,
        messages: [{
          role: 'user',
          content: `Business: ${businessType}. Challenge: ${challenge}.`
        }]
      })
    });

    const data = await response.json();
    // Anthropic returns an array of content blocks; we extract the text from the first one
    const aiResponse = JSON.parse(data.content[0].text);
    return res.status(200).json(aiResponse);

  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate response' });
  }
}