const Review = require('../models/Review');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let platformSummaryCache = { timestamp: 0, text: null };

const MODELS_TO_TRY = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getRetryDelayMs = (msg, defaultMs = 5000) => {
    const match = msg.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
    return match ? Math.ceil(parseFloat(match[1]) * 1000) : defaultMs;
};

/**
 * Generates a simple local summary based on review data (no API needed).
 */
const buildLocalSummary = (reviews) => {
    const total = reviews.length;
    const avg = (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1);
    const fiveStars = reviews.filter(r => r.rating === 5).length;
    const oneTwoStars = reviews.filter(r => r.rating <= 2).length;

    let sentiment = 'mixed';
    if (avg >= 4.2) sentiment = 'very positive';
    else if (avg >= 3.5) sentiment = 'mostly positive';
    else if (avg <= 2.5) sentiment = 'mostly negative';

    let summary = `Based on ${total} review${total > 1 ? 's' : ''}, this product has a ${sentiment} reception with an average rating of ${avg}/5. `;

    if (fiveStars > total * 0.6) {
        summary += `The majority of customers (${fiveStars} out of ${total}) gave 5 stars, showing strong satisfaction. `;
    }
    if (oneTwoStars > 0) {
        summary += `${oneTwoStars} customer${oneTwoStars > 1 ? 's' : ''} rated it 1-2 stars, suggesting some areas for improvement. `;
    }
    if (avg >= 4.0) {
        summary += `Overall, customers appear happy with this product.`;
    } else if (avg >= 3.0) {
        summary += `There is room for improvement based on customer feedback.`;
    } else {
        summary += `The product may need significant improvements to satisfy customers.`;
    }

    return `📊 (Auto-generated summary) ${summary}`;
};

const buildLocalPlatformSummary = (reviews) => {
    const total = reviews.length;
    const avg = (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1);
    const lowRated = reviews.filter(r => r.rating <= 2).length;
    const highRated = reviews.filter(r => r.rating >= 4).length;

    return `📊 (Auto-generated platform insight) In the past 30 days, ${total} reviews were submitted with an average platform rating of ${avg}/5. ${highRated} reviews were positive (4-5 stars) and ${lowRated} were negative (1-2 stars). ${lowRated > total * 0.2 ? 'Admin should investigate recurring complaints to improve platform quality.' : 'The platform is performing well overall.'}`;
};

const callGemini = async (apiKey, prompt) => {
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of MODELS_TO_TRY) {
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                return result.response.text();
            } catch (err) {
                const msg = err.message || '';

                if (msg.includes('404') || msg.includes('not found') || msg.includes('not supported')) {
                    break; // Try next model
                }

                if (msg.includes('429') || msg.includes('quota') || msg.includes('retry') || msg.includes('rate')) {
                    attempts++;
                    if (attempts >= maxAttempts) break;
                    const waitMs = Math.min(getRetryDelayMs(msg, 5000), 8000);
                    console.log(`[AI] Rate limited on ${modelName}. Waiting ${Math.round(waitMs / 1000)}s...`);
                    await sleep(waitMs);
                    continue;
                }

                throw err;
            }
        }
    }

    return null; // Signal to caller to use local fallback
};

const generatePlatformSummary = async () => {
    try {
        const now = Date.now();
        if (platformSummaryCache.text && (now - platformSummaryCache.timestamp < 10 * 60 * 1000)) {
            return platformSummaryCache.text;
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const reviews = await Review.find({ created_at: { $gte: thirtyDaysAgo } });

        if (!reviews || reviews.length < 5) {
            return 'Not enough recent reviews to generate a platform insight.';
        }

        const apiKey = process.env.GEMINI_API_KEY;
        let responseText = null;

        if (apiKey) {
            const reviewTexts = reviews.map(r => `Rating: ${r.rating} stars - Feedback: ${r.feedback}`).join('\n');
            const prompt = `You are a marketplace moderation assistant for a university student marketplace called Hustle Hub.
Here is a collection of recent customer reviews from the past 30 days:
${reviewTexts}

In 2-3 sentences, identify the most common complaint or issue pattern across these reviews, and suggest one concrete action the admin could take to improve the platform.`;

            responseText = await callGemini(apiKey, prompt);
        }

        // Use local fallback if AI failed
        if (!responseText) {
            responseText = buildLocalPlatformSummary(reviews);
        }

        platformSummaryCache = { timestamp: now, text: responseText };
        return responseText;
    } catch (error) {
        console.error('[AI] Platform summary error:', error.message);
        return '⚠️ Unable to generate platform insight. Please try again later.';
    }
};

const generateReviewSummary = async (productId) => {
    try {
        const reviews = await Review.find({ product_id: productId });

        if (!reviews || reviews.length < 3) {
            return 'Not enough reviews to generate a summary yet. At least 3 reviews are required.';
        }

        const apiKey = process.env.GEMINI_API_KEY;
        let responseText = null;

        if (apiKey) {
            const reviewTexts = reviews.map(r => `Rating: ${r.rating} stars - Feedback: ${r.feedback}`).join('\n');
            const prompt = `You are a helpful assistant for a university student marketplace.
Here are the customer reviews for a product:
${reviewTexts}

Give a concise, friendly 3–4 sentence summary of overall sentiment, common praise, and any repeated complaints.`;

            responseText = await callGemini(apiKey, prompt);
        }

        // Use local fallback if API call failed
        if (!responseText) {
            responseText = buildLocalSummary(reviews);
        }

        return responseText;
    } catch (error) {
        console.error('[AI] Review summary error:', error.message);
        return '⚠️ Unable to generate review summary. Please try again later.';
    }
};

module.exports = { generateReviewSummary, generatePlatformSummary };
