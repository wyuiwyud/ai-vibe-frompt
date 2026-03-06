
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
    console.log("Testing Gemini v1...");
    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Hello, are you there?" },
                    ],
                }],
            }),
        });
        const data = await res.json();
        console.log("Status:", res.status);
        if (res.status !== 200) {
            console.log("Error Detail:", JSON.stringify(data, null, 2));
        } else {
            console.log("Response:", data.candidates[0].content.parts[0].text);
        }
    } catch (e) {
        console.error("Test Error:", e);
    }
}

testGemini();
