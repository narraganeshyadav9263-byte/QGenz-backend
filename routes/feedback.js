const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Submit feedback
router.post('/submit', async (req, res) => {
    try {
        const { name, email, message, rating } = req.body;

        // Input validation
        if (!name || !email || !message || !rating) {
            return res.status(400).json({ 
                message: 'All fields are required' 
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ 
                message: 'Rating must be between 1 and 5' 
            });
        }

        const feedback = new Feedback({
            name,
            email,
            message,
            rating
        });
        await feedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ 
            message: 'Error submitting feedback', 
            error: error.message 
        });
    }
});

// Get all feedback (admin only)
router.get('/all', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ 
            message: 'Error fetching feedback', 
            error: error.message 
        });
    }
});

// Update feedback status (admin only)
router.put('/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!status || !['pending', 'reviewed'].includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status. Must be either "pending" or "reviewed"' 
            });
        }

        const feedback = await Feedback.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({ 
                message: 'Feedback not found' 
            });
        }

        res.json(feedback);
    } catch (error) {
        console.error('Error updating feedback status:', error);
        res.status(500).json({ 
            message: 'Error updating feedback status', 
            error: error.message 
        });
    }
});

module.exports = router; 