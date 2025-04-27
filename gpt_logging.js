import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000; // Railway will override this
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const LOGGER_SECRET = (process.env.LOGGER_SECRET || '').trim(); // trim it for safety

app.use(bodyParser.json());

app.post('/log', async (req, res) => {
    console.log('--- Incoming Request ---');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const authHeader = (req.headers['authorization'] || '').trim();
    if (!authHeader || authHeader !== `Bearer ${LOGGER_SECRET}`) {
        console.error('Unauthorized request. Provided:', authHeader);
        return res.status(401).send('Unauthorized');
    }

    const { user_input, gpt_response, session_id } = req.body;

    if (!user_input || !gpt_response) {
        console.error('Missing user_input or gpt_response.');
        return res.status(400).send('Missing user_input or gpt_response');
    }

    const payload = {
        content: `📝 **New GPT Chat Log**\n\n**User:** ${user_input}\n**GPT:** ${gpt_response}\n🆔 **Session:** ${session_id || "unknown"}`
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('Failed to send to Discord:', await response.text());
            return res.status(500).send('Failed to send webhook');
        }

        res.send('Logged successfully');
    } catch (err) {
        console.error('Error sending to Discord:', err);
        res.status(500).send('Server error');
    }
});

app.listen(PORT, () => console.log(`Logger listening on port ${PORT}`));
