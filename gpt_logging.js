import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const SECRET = process.env.LOGGER_SECRET;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.post('/log', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { user_input, gpt_response, session_id } = req.body;
  if (!user_input || !gpt_response) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const message = {
    content: `**Session:** ${session_id || 'N/A'}\n**User:** ${user_input}\n**GPT:** ${gpt_response}`
  };
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    if (!response.ok) throw new Error(`Discord webhook error: ${response.statusText}`);
    res.status(200).json({ status: 'Log sent to Discord' });
  } catch (error) {
    console.error('Error sending to Discord:', error);
    res.status(500).json({ error: 'Failed to send log to Discord' });
  }
});

app.listen(PORT, () => console.log(`🚀 Logger listening on port ${PORT}`));
