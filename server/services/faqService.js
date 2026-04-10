const FAQ = require('../models/FAQ');
const fs = require('fs').promises;
const path = require('path');

let faqCache = null;

// Parse string to tokens, removing punctuation
const parseTokens = (str) => {
    return str.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/).filter(word => word.length > 0);
};

// Common stopwords to ignore
const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'it', 'its', 'to', 'for', 'with', 'about', 'on', 'in', 'at', 'do', 'does', 'did']);

/**
 * Migration function to seed DB from JSON if empty
 */
const seedFaqsIfEmpty = async () => {
    try {
        const count = await FAQ.countDocuments();
        if (count === 0) {
            console.log('[FAQ Service] Database empty. Seeding from faqs.json...');
            const filePath = path.join(__dirname, '../data/faqs.json');
            const data = await fs.readFile(filePath, 'utf8');
            const initialFaqs = JSON.parse(data);
            
            // Map JSON structure to Model structure if needed
            const mappedFaqs = initialFaqs.map(f => ({
                question: f.question,
                answer: f.answer,
                category: f.category || 'General',
                keywords: f.keywords || []
            }));

            await FAQ.insertMany(mappedFaqs);
            console.log(`[FAQ Service] Seeded ${mappedFaqs.length} FAQs successfully.`);
        }
    } catch (error) {
        console.error('[FAQ Service] Seeding error:', error);
    }
};

const getFaqs = async () => {
    try {
        // Ensure DB is seeded before first fetch
        await seedFaqsIfEmpty();
        
        // Fetch fresh from DB (no local cache to ensure admin changes reflect immediately)
        return await FAQ.find({});
    } catch (error) {
        console.error('[FAQ Service] Error fetching FAQs from DB:', error);
        return [];
    }
};

const findBestMatch = async (userMessage) => {
    const faqs = await getFaqs();
    if (!faqs || faqs.length === 0) return null;
    
    const userTokens = parseTokens(userMessage).filter(t => !stopWords.has(t));
    
    let bestMatch = null;
    let highestScore = 0;
    
    const MIN_THRESHOLD = 0.5;
    
    for (const faq of faqs) {
        // Case-insensitive exact phrase match
        if (faq.question.toLowerCase() === userMessage.toLowerCase().trim()) {
            return faq;
        }

        // Keywords check
        const userClean = parseTokens(userMessage).join(' ');
        if (faq.keywords && faq.keywords.length > 0) {
            for (const kw of faq.keywords) {
                const kwClean = parseTokens(kw).join(' ');
                if (kwClean === userClean) {
                    return faq;
                }
            }
        }
        
        const faqTokens = parseTokens(faq.question).filter(t => !stopWords.has(t));
        if (faqTokens.length === 0) continue;
        
        let matchCount = 0;
        for (const token of faqTokens) {
            if (userTokens.includes(token)) {
                matchCount++;
            }
        }
        
        const faqSatisfied = matchCount / faqTokens.length;
        const userProvided = userTokens.length > 0 ? matchCount / userTokens.length : 0;
        const score = (faqSatisfied * 0.7) + (userProvided * 0.3);
        
        if (score > highestScore && score >= MIN_THRESHOLD) {
            highestScore = score;
            bestMatch = faq;
        }
        
        // Partial phrase matching
        if (userMessage.toLowerCase().includes(faq.question.toLowerCase()) || 
            faq.question.toLowerCase().includes(userMessage.toLowerCase())) {
            
            const substringScore = 0.8;
            if (substringScore > highestScore && substringScore >= MIN_THRESHOLD) {
                highestScore = substringScore;
                bestMatch = faq;
            }
        }
    }
    
    return bestMatch;
};

module.exports = {
    findBestMatch,
    getFaqs
};
