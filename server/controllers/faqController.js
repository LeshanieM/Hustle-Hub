const FAQ = require('../models/FAQ');

// Get all FAQs
const getAllFaqs = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { question: { $regex: search, $options: 'i' } },
                { answer: { $regex: search, $options: 'i' } },
                { keywords: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const faqs = await FAQ.find(query).sort({ category: 1, createdAt: -1 });
        res.status(200).json(faqs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching FAQs", error: error.message });
    }
};

// Create a new FAQ
const createFaq = async (req, res) => {
    try {
        const { question, answer, category, keywords } = req.body;
        const newFaq = new FAQ({ question, answer, category, keywords });
        await newFaq.save();
        res.status(201).json(newFaq);
    } catch (error) {
        res.status(400).json({ message: "Error creating FAQ", error: error.message });
    }
};

// Update an FAQ
const updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFaq = await FAQ.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedFaq) return res.status(404).json({ message: "FAQ not found" });
        res.status(200).json(updatedFaq);
    } catch (error) {
        res.status(400).json({ message: "Error updating FAQ", error: error.message });
    }
};

// Delete an FAQ
const deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFaq = await FAQ.findByIdAndDelete(id);
        if (!deletedFaq) return res.status(404).json({ message: "FAQ not found" });
        res.status(200).json({ message: "FAQ deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting FAQ", error: error.message });
    }
};

module.exports = {
    getAllFaqs,
    createFaq,
    updateFaq,
    deleteFaq
};
