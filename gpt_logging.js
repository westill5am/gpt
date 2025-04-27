import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const LOGGER_SECRET = (process.env.LOGGER_SECRET || '').trim();

app.use(bodyParser.json());

// ✅ ADD THIS:
app.get('/', (req, res) => {
  res.send('✅ Logger server is running!');
});

app.post('/log', async (req, res) => {
  const auth = (req.headers['authorization'] || '').trim();
  if (!auth || auth !== `Bearer ${LOGGER_SECRET}`) {
    return res.status(401).send('Unauthorized');
  }

  const { user_input, gpt_response, session_id } = req.body;
  if (!user_input || !gpt_response) {
    return res.status(400).send('Missing user_input or gpt_response');
  }

  res.status(200).send('Received');

  const payload = {
    content: `📝 **New GPT Chat Log**\n\n👤 **User:** ${user_input}\n🤖 **GPT:** ${gpt_response}\n🆔 **Session:** ${session_id || "unknown"}`
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const resp = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        console.log(`✅ Log sent to Discord [Attempt ${attempt}]`);
        break;
      } else {
        console.error(`❌ Discord error [Attempt ${attempt}]:`, await resp.text());
      }
    } catch (err) {
      console.error(`❌ Discord fetch failed [Attempt ${attempt}]:`, err);
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // retry delay
  }
});

app.listen(PORT, () => console.log(`🚀 Logger listening on port ${PORT}`));
