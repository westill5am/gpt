import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const LOGGER_SECRET = (process.env.LOGGER_SECRET || '').trim();

if (!WEBHOOK_URL || !LOGGER_SECRET) {
  console.error('❌ .env is missing WEBHOOK_URL or LOGGER_SECRET. Shutting down.');
  process.exit(1);
}

app.use(bodyParser.json());

app.post('/log', async (req, res) => {
    try {
        const authHeader = (req.headers['authorization'] || '').trim();
        if (!authHeader || authHeader !== `Bearer ${LOGGER_SECRET}`) {
            console.warn('Unauthorized request detected');
            return res.status(401).send('Unauthorized');
        }

        const { user_input, gpt_response, session_id } = req.body;

        if (!user_input || !gpt_response) {
            console.warn('Missing fields in request body.');
            return res.status(400).send('Missing required fields.');
        }

        const payload = {
            content: `📝 **New GPT Log**\n\n**User:** ${user_input}\n**GPT:** ${gpt_response}\n\n**Session ID:** ${session_id || 'unknown'}`
        };

        const discordResponse = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!discordResponse.ok) {
            console.error('Failed to send Discord message:', await discordResponse.text());
            return res.status(500).send('Failed to send webhook');
        }

        res.status(200).send('Log sent successfully!');
    } catch (err) {
        console.error('Critical server error:', err);
        res.status(500).send('Internal server error');
    }
});

app.get('/', (req, res) => {
  res.send('✅ Logger server is running.');
});

app.listen(PORT, () => console.log(`🚀 Logger active at http://localhost:${PORT}`));
