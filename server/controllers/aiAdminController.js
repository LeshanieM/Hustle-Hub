const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with API Key from environment variables
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const handleAdminQuery = async (req, res) => {
    if (!genAI) {
        return res.status(500).json({ error: 'Gemini API key is not configured in the server environment.' });
    }
    try {
        const { question, role, data } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        if (role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized role' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `You are an AI platform intelligence assistant for a campus business system (HustleHub).

User Role: Campus Admin

Platform Data:
${JSON.stringify(data, null, 2)}

Answer the following question using only the provided system data:
Question: ${question}

Provide the response in 3 sections:
1. Answer
2. Reason
3. Recommendation

Requirement:
- Do not use markdown headers for the section names, just use "1. Answer", "2. Reason", "3. Recommendation".
- Be professional and focused on platform/admin intelligence.
- If data is missing or insufficient, state that clearly but still provide the best possible insight based on what is available.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse the response into structured fields if possible, or just return as is
        // The frontend will handle the display.
        
        return res.status(200).json({ response: responseText });

    } catch (error) {
        console.error('[AIAdminController] Error processing admin query:', error.message);
        if (error.response) {
            console.error('[AIAdminController] Gemini API Error Response:', error.response.data);
        }
        return res.status(500).json({ error: 'Failed to process AI query', details: error.message });
    }
};

module.exports = {
    handleAdminQuery
};
