const express = require('express');
const router = express.Router();
const { logActivity } = require('../utils/activityLogger');

// Generate questions
router.post('/generate', async (req, res) => {
  try {
    const { userId, questionType, difficultyLevel, numQuestions } = req.body;
    
    // Your existing question generation logic here
    const questions = []; // This would be populated by your actual question generation logic

    // Log activity
    await logActivity('question_answered', userId, `Generated ${numQuestions} ${questionType} questions`, {
      questionType,
      difficultyLevel,
      numQuestions
    });

    res.json({ success: true, questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate questions' 
    });
  }
});

module.exports = router; 