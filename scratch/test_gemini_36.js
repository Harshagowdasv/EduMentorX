import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testSingleModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  console.log(`Testing model: ${model}...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Hi' }],
          },
        ],
      }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`SUCCESS for ${model}:`, data.candidates?.[0]?.content?.parts?.[0]?.text);
    } else {
      console.log(`FAILED for ${model}:`, data.error?.message || data);
    }
  } catch (err) {
    console.error(`ERROR for ${model}:`, err.message);
  }
}

async function run() {
  await testSingleModel('gemini-3.6-flash');
  await testSingleModel('gemini-2.5-flash-lite');
  await testSingleModel('gemini-1.5-flash-latest');
}

run();
