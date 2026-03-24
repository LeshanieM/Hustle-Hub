const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'c:/Users/PC/Desktop/ITPM/Hustle-Hub/server/.env' });

const MODELS_TO_TRY = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
];

const test = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key present:', !!apiKey, '| Length:', apiKey ? apiKey.length : 0);
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of MODELS_TO_TRY) {
        try {
            console.log(`\nTesting model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'hello' in one word.");
            console.log(`✅ ${modelName} works! Response: ${result.response.text().trim()}`);
            break; // Found a working model
        } catch (error) {
            console.error(`❌ ${modelName} failed: ${error.message}`);
        }
    }
};

test();
