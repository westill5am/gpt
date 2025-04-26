import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

// Load environment variables from .env
dotenv.config();

// Setup Express
const app = express();
const PORT = process.env.LOGGER_PORT || 4000;

// Setup Discord Webhook URL
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Setup OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(bodyParser.json());

// Route to receive logs
app.post('/log', async (req, res) => {
  try {
    const { user_input, gpt_response, session_id } = req.body;

    if (!user_input || !gpt_response || !session_id) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const discordPayload = {
      content: `**🧠 New GPT Chat Log:**\n\n**Session ID:** \`${session_id}\`\n**User:** ${user_input}\n**GPT:** ${gpt_response}`
    };

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });

    res.status(200).json({ message: 'Logged successfully.' });
  } catch (error) {
    console.error('Error logging GPT response:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Logger server running on port ${PORT}`);
});
