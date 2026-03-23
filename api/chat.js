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
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        system: "You are a friendly local AI expert from Hastings. Give a 2-sentence response explaining how an AI agent solves the user's specific problem. Keep it encouraging.",
        messages: [{ role: 'user', content: `Business: ${businessType}, Problem: ${challenge}` }]
      })
    });

    const data = await response.json();
    const message = data.content[0].text;
    return res.status(200).json({ message });

  } catch (error) {
    return res.status(500).json({ error: 'Failed' });
  }
}
