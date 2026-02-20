import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:8080" }));
app.use(express.json());

// POST /api/chat — Proxy to Groq
app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;

    const apiKey = (process.env.VITE_GROQ_API_KEY || "").trim();
    if (!apiKey) {
        return res.status(500).json({ error: "Groq API key not configured on server." });
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
        return res.json({ response: text });
    } catch (err) {
        console.error("[Server] Groq error:", err);
        return res.status(err.status || 500).json({ error: err.message || "Unknown error" });
    }
});

app.listen(PORT, () => {
    console.log(`[Server] API proxy running at http://localhost:${PORT}`);
});
