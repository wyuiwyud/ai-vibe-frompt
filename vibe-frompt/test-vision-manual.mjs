
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function testGroq() {
    console.log("Testing Groq...");
    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.2-11b-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: "What is in this image? Answer in 3 words." },
                            { type: 'image_url', image_url: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Felis_catus-cat_on_snow.jpg/220px-Felis_catus-cat_on_snow.jpg" } },
                        ],
                    },
                ],
                temperature: 0.2,
            }),
        });
        const data = await res.json();
        console.log("Groq Response Status:", res.status);
        console.log("Groq Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Groq Test Error:", e);
    }
}

testGroq();
