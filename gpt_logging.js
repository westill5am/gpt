import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const LOGGER_SECRET = (process.env.LOGGER_SECRET || '').trim();

app.use(bodyParser.json());

app.post('/log', async (req, res) => {
  console.log('✅ Received /log request');

  const auth = (req.headers['authorization'] || '').trim();
  if (!auth || auth !== `Bearer ${LOGGER_SECRET}`) {
    console.error('❌ Unauthorized access attempt');
    return res.status(401).send('Unauthorized');
  }

  const { user_input, gpt_response, session_id } = req.body;

  if (!user_input || !gpt_response) {
    console.error('❌ Missing fields');
    return res.status(400).send('Missing user_input or gpt_response');
  }

  // ✅ Immediately respond
  res.status(200).send('Received');

  // ✅ Then do Discord POST
  const payload = {
    content: `📝 **New GPT Chat Log**\n\n👤 **User:** ${user_input}\n🤖 **GPT:** ${gpt_response}\n🆔 **Session:** ${session_id || "unknown"}`
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ Successfully sent to Discord');
    } else {
      const text = await response.text();
      console.error(`❌ Discord webhook rejected. Status: ${response.status}, Body: ${text}`);
    }
  } catch (err) {
    console.error('❌ Failed to POST to Discord webhook:', err.message);
  }
});

app.get('/', (req, res) => {
  res.send('✅ Logger running.');
});

app.listen(PORT, () => console.log(`🚀 Logger listening on port ${PORT}`));
