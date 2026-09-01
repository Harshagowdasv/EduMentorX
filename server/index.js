import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createInitialAdminAccount, checkAdminStatus } from './initAdminService.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Check Initial Admin Status
app.get('/api/admin/status', async (req, res) => {
  try {
    const status = await checkAdminStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// One-Time Initial Admin Account Creation Endpoint
app.post('/api/admin/init-initial-admin', async (req, res) => {
  try {
    const { initialPassword } = req.body;

    if (!initialPassword) {
      return res.status(400).json({ error: 'initialPassword is required in request body.' });
    }

    const result = await createInitialAdminAccount(initialPassword);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (err) {
    console.error('[Admin Init Error]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Secure Server-side AI Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Server Gemini API key not configured' });
    }

    // Call official Gemini REST API (gemini-1.5-flash) using server secret key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const systemPrompt = `You are EduMentorX AI Avatar Assistant, an empathetic, encouraging EdTech mentor for university students. 
Student Context: Name: ${context?.name || 'Student'}, CGPA: ${context?.cgpa || 'N/A'}, Attendance: ${context?.attendance || 'N/A'}%, Department: ${context?.department || 'Engineering'}.
Keep responses helpful, structured, concise, and educational. Clearly identify yourself as an AI assistant.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }],
      },
    ];

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('Gemini API error:', errorText);
      return res.status(500).json({ error: 'Gemini API call failed' });
    }

    const data = await geminiRes.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I am happy to assist you with your academic goals!';

    res.json({
      text: candidate,
      emotion: 'speaking',
    });
  } catch (err) {
    console.error('Server error processing AI chat:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`[EduMentorX Backend Server] Listening on http://localhost:${PORT}`);
});
