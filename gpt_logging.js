import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const LOGGER_SECRET = process.env.LOGGER_SECRET;

app.use(bodyParser.json());

app.post('/log', async (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth || auth !== `Bearer ${LOGGER_SECRET}`) {
    return res.status(401).send('Unauthorized');
  }

  const { user_input, gpt_response, session_id } = req.body;

  if (!user_input || !gpt_response) {
    return res.status(400).send('Missing user_input or gpt_response');
  }

  // ✅ FIRST: reply to ChatGPT immediately
  res.status(200).send('Received');

  // ✅ THEN: send to Discord in background
  try {
    const payload = {
      content: `📝 **New GPT Chat Log**\n\n**User:** ${user_input}\n**GPT:** ${gpt_response}\n**Session:** ${session_id || 'unknown'}`
    };

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('✅ Successfully sent to Discord');
  } catch (err) {
    console.error('❌ Failed to send to Discord:', err);
  }
});

app.listen(PORT, () => console.log(`Logger listening on port ${PORT}`));
