const QuoteService = require('../services/quotes.service');

module.exports = {
    
    async createQuote(req, res) {
        try {
            const quote = await QuoteService.createQuote(req.body);
            res.status(201).json(quote);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getAllQuotes(req, res) {
        try {
            const quotes = await QuoteService.getAllQuotes();
            res.json(quotes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getQuoteById(req, res) {
        try {
            const quote = await QuoteService.getQuoteById(req.params.id);
            res.json(quote);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async updateQuoteStatus(req, res) {
        try {
            const updated = await QuoteService.updateQuoteStatus(req.params.id, req.body.status);
            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async convertQuoteToOrder(req, res) {
        try {
            const order = await QuoteService.convertToOrder(req.params.id);
            res.json(order);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

};
