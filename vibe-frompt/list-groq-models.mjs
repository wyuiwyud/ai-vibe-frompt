
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function listModels() {
    console.log("Listing Groq Models...");
    try {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
        });
        const data = await res.json();
        console.log("Models:", JSON.stringify(data.data.map(m => m.id), null, 2));
    } catch (e) {
        console.error("List Models Error:", e);
    }
}

listModels();
