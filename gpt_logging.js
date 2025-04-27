import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

export async function logToDiscord({ user_input, gpt_response, session_id }) {
  try {
    const payload = {
      user_input,
      gpt_response,
      session_id: session_id || 'unknown'
    };

    const response = await fetch(process.env.LOGGER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LOGGER_SECRET}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Failed to log GPT conversation:', await response.text());
    }
  } catch (err) {
    console.error('Error sending GPT log:', err);
  }
}
