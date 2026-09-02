import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testChat() {
  const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-pro',
    'gemini-3.6-flash',
  ];

  const contents = [
    {
      role: 'user',
      parts: [{ text: 'Hi' }],
    },
  ];

  for (const model of modelsToTest) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    console.log(`\nTesting model: ${model}...`);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`SUCCESS! Response from ${model}:`, data.candidates?.[0]?.content?.parts?.[0]?.text);
        break;
      } else {
        console.log(`FAILED ${model}:`, JSON.stringify(data));
      }
    } catch (err) {
      console.error(`ERROR ${model}:`, err.message);
    }
  }
}

testChat();
