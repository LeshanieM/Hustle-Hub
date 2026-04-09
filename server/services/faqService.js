
const fs = require('fs').promises;
const path = require('path');

let faqCache = null;

// Parse string to tokens, removing punctuation
const parseTokens = (str) => {
    return str.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/).filter(word => word.length > 0);
};

// Common stopwords to ignore in matching for better semantic extraction
const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'it', 'its', 'to', 'for', 'with', 'about', 'on', 'in', 'at', 'do', 'does', 'did']);

const getFaqs = async () => {
    // 1. Cache FAQ JSON after first load
    if (faqCache) {
        return faqCache;
    }
    
    try {
        const filePath = path.join(__dirname, '../data/faqs.json');
        const data = await fs.readFile(filePath, 'utf8');
        faqCache = JSON.parse(data);
        return faqCache;
    } catch (error) {
        console.error('Error loading FAQs:', error);
        return [];
    }
};

const findBestMatch = async (userMessage) => {
    const faqs = await getFaqs();
    if (!faqs || faqs.length === 0) return null;
    
    const userTokens = parseTokens(userMessage).filter(t => !stopWords.has(t));
    
    let bestMatch = null;
    let highestScore = 0;
    
    // Minimum threshold before match is valid
    const MIN_THRESHOLD = 0.5; // Require at least 50% match score
    
    for (const faq of faqs) {
        // Case-insensitive exact phrase match check
        if (faq.question.toLowerCase() === userMessage.toLowerCase().trim()) {
            return faq;
        }

        // Keywords check for short button phrases like "Try Simulator"
        const userClean = parseTokens(userMessage).join(' ');
        if (faq.keywords) {
            for (const kw of faq.keywords) {
                const kwClean = parseTokens(kw).join(' ');
                if (kwClean === userClean) {
                    return faq; // Exact match on keyword (ignores emojis/punctuation)
                }
            }
        }
        
        const faqTokens = parseTokens(faq.question).filter(t => !stopWords.has(t));
        if (faqTokens.length === 0) continue;
        
        // Keyword/token finding
        let matchCount = 0;
        for (const token of faqTokens) {
            if (userTokens.includes(token)) {
                matchCount++;
            }
        }
        
        // Token scoring
        // Calculate score based on how much of the original FAQ query is satisfied by the user's input
        // plus how much of the user's input aligns with the FAQ.
        const faqSatisfied = matchCount / faqTokens.length;
        const userProvided = userTokens.length > 0 ? matchCount / userTokens.length : 0;
        
        // Blended score, prioritizes satisfying the FAQ core tokens
        const score = (faqSatisfied * 0.7) + (userProvided * 0.3);
        
        // Highest-score selection
        if (score > highestScore && score >= MIN_THRESHOLD) {
            highestScore = score;
            bestMatch = faq;
        }
        
        // Partial phrase matching (e.g. string subset)
        if (userMessage.toLowerCase().includes(faq.question.toLowerCase()) || 
            faq.question.toLowerCase().includes(userMessage.toLowerCase())) {
            
            // Substring phrase matches are a strong signal
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
