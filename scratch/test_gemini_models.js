import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(m => {
        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
          console.log(`- ${m.name} (${m.displayName})`);
        }
      });
    } else {
      console.log('No models returned:', JSON.stringify(data).substring(0, 300));
    }
  } catch (err) {
    console.error('Error listing models:', err.message);
  }
}

listModels();
