
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function testGroqLlama4() {
    console.log("Testing Groq Llama 4 Scout...");
    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
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
        console.log("Status:", res.status);
        if (res.status !== 200) {
            console.log("Error Detail:", JSON.stringify(data, null, 2));
        } else {
            console.log("Response:", data.choices[0].message.content);
        }
    } catch (e) {
        console.error("Test Error:", e);
    }
}

testGroqLlama4();
