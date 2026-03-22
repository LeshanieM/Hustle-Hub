const Tesseract = require('tesseract.js');

const extractTextFromImage = async (imagePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
        console.log("OCR Extracted text length:", text.length, "characters");
        return text;
    } catch (error) {
        console.error("OCR API Error:", error);
        throw new Error('Failed to process ID image');
    }
};

const extractStudentId = async (imagePath) => {
    try {
        const text = await extractTextFromImage(imagePath);
        
        // Step 1: Handle common OCR mistakes (Optional requirement)
        // For example, reading '1T' as 'IT', 'B' as '8', 'O' as '0'
        let cleanedText = text
            .replace(/1T/gi, 'IT')
            .replace(/B/gi, '8')
            .replace(/O/gi, '0');

        // Step 2: Use a flexible regex that supports spaces
        // Matches "IT" followed by exactly 8 digits, allowing for any spaces between blocks
        // e.g. "IT 23 1648 26" or "IT23 16 48 26"
        const regex = /IT\s*\d{2}\s*\d{4}\s*\d{2}/i;
        const match = cleanedText.match(regex);
        
        if (match) {
            // Step 3: Remove all spaces and convert to lowercase
            // match[0] contains the matched text with spaces (e.g. "IT 23 1648 26")
            const formattedId = match[0].replace(/\s+/g, '').toLowerCase();
            
            // Final output will be like: it23164826
            return formattedId;
        }
        
        return null;
    } catch (error) {
        return null;
    }
};

module.exports = { extractTextFromImage, extractStudentId };
