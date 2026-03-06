
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// 1x1 Transparent Pixel Base64
const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function testGroqBase64() {
    console.log("Testing Groq Llama 4 Scout with Base64...");
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
                            { type: 'text', text: "Just say 'Image Received' if you see an image." },
                            { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } },
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

testGroqBase64();
