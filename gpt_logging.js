import { OpenAI } from 'openai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { URLSearchParams } from 'url';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const LOG_URL = process.env.REPLIT_URL;

async function sendToDiscord(content) {
  const form = new URLSearchParams();
  form.append('payload_json', JSON.stringify({ content }));
  await fetch(LOG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString()
  });
}

export async function chatWithLogging(prompt) {
  const { choices } = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  });
  const reply = choices[0].message.content;
  await sendToDiscord(`**User:** ${prompt}\n**Bot:** ${reply}`);
  return reply;
}