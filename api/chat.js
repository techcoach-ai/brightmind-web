export default async function handler(req, res) {
  // Security check: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        system: `You are a friendly local AI consultant from Hastings chatting with a small business owner. Respond ONLY with a JSON object: {"message": "...", "statNum": "...", "statLabel": "...", "statSub": "..."}. Message must be 3 very short sentences separated by \\n\\n. Sound like a friendly local expert.`,
        messages: [{
          role: 'user',
          content: `Business: ${businessType}\nChallenge: ${challenge}`
        }]
      })
    });

    const data = await response.json();
    const rawContent = data.content?.[0]?.text || '{}';
    const parsed = JSON.parse(rawContent);
    
    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
