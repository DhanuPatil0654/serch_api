require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Google Custom Search API Setup
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Route to get search results from Google Custom Search
app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        const response = await axios.get(
            `https://www.googleapis.com/customsearch/v1`,
            {
                params: {
                    key: GOOGLE_API_KEY,
                    cx: SEARCH_ENGINE_ID,
                    q: query,
                },
            }
        );

        res.json(response.data.items || []);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong", details: error.message });
    }
});


app.post("/get/code", async (req, res) => {
    try {
        const query = req.body.query;
        if (!query) return res.status(400).json({ error: "Query is required" });

        // Correct request format for Gemini API
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ role: "user", parts: [{ text: query }] }],
            }
        );

        // Extract AI-generated response
        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

        res.json({ reply });
    } catch (error) {
        console.error("Error fetching response from Gemini:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch response from Gemini", details: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
