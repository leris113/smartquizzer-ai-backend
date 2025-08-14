import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// ✅ Allow all origins for CORS (so your frontend can call this)
app.use(cors({
    origin: "*", // You can replace "*" with your site URL for extra security
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Get your API key from Render's Environment Variables
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
        res.json({ answer: data.choices?.[0]?.message?.content || "No answer" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI request failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
