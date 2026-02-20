import Groq from "groq-sdk";

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = (process.env.VITE_GROQ_API_KEY || "").trim();
    if (!apiKey) {
        return res.status(500).json({ error: "Groq API key not configured on server." });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid request: messages array required." });
    }

    try {
        const groq = new Groq({ apiKey });
        const response = await groq.chat.completions.create({
            messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
        });
        const text = response.choices[0]?.message?.content || "";
        return res.status(200).json({ response: text });
    } catch (err) {
        console.error("[Vercel API] Groq error:", err);
        return res.status(err.status || 500).json({ error: err.message || "Unknown error" });
    }
}
