const { GoogleGenerativeAI } = require('@google/generative-ai');
const faqService = require('../services/faqService');

// Initialize Gemini with API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        
        // 1. Add proper validation for empty messages
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required and cannot be empty' });
        }
        
        const userMessage = message.trim();
        
        // 2 & 3. Search static FAQ knowledge base
        const faqMatch = await faqService.findBestMatch(userMessage);
        
        if (faqMatch) {
            console.log(`[ChatController] Reply source: FAQ Match (Q: "${faqMatch.question}")`);
            return res.status(200).json({ reply: faqMatch.answer });
        }
        
        // 4. Fall back to Gemini AI if no FAQ matches
        console.log('[ChatController] Reply source: Gemini AI Fallback');
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Add minimal context to instruct the AI behavior
        const prompt = `You are a helpful customer support chatbot for Hustle-Hub. Answer the following user question concisely and politely.\n\nUser: ${userMessage}`;
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // 5. Always return responses in { "reply": "string" } format
        return res.status(200).json({ reply: responseText });
        
    } catch (error) {
        console.error('[ChatController] Error processing chat:', error);
        
        // Catch gracefully and prevent shutting down API, keep future-ready
        return res.status(500).json({ error: 'Failed to process chat message' });
    }
};

module.exports = {
    handleChat
};

