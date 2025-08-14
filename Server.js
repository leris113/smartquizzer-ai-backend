import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// ✅ CORS fix: Apply globally to ALL routes, including preflight OPTIONS
app.use(cors({
    origin: "*", // change to your domain later for security
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Handle preflight requests for all routes
app.options("*", cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;

app.post("/ask-ai", async (req, res) => {
    try {
        const { prompt } = req.body;

        const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${DEEPINFRA_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 300
            })
        });

        const data = await response.json();

        // ✅ Force CORS header on response
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json({ answer: data.choices?.[0]?.message?.content || "No answer" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI request failed" });
    }
});

app.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({ status: "Backend is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
