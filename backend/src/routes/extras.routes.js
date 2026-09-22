const express = require('express');
const router = express.Router();
const thirdPartyService = require('../services/thirdParty.service');

/**
 * @swagger
 * /api/extras/quote:
 *   get:
 *     summary: Get a motivational quote
 *     tags: [Extras]
 *     responses:
 *       200:
 *         description: Success
 */
// GET /api/extras/quote - Get a motivational quote (Public)
router.get('/quote', async (req, res) => {
    try {
        const quote = await thirdPartyService.getMotivationalQuote();
        res.status(200).json({
            success: true,
            message: 'Quote fetched successfully',
            data: quote
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quote'
        });
    }
});

/**
 * @swagger
 * /api/extras/fact:
 *   get:
 *     summary: Get a random ocean fact
 *     tags: [Extras]
 *     responses:
 *       200:
 *         description: Success
 */
// GET /api/extras/fact - Get an ocean/marine fact (Public)
router.get('/fact', async (req, res) => {
    try {
        const fact = await thirdPartyService.getOceanFact();
        res.status(200).json({
            success: true,
            message: 'Fact fetched successfully',
            data: fact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch fact'
        });
    }
});

module.exports = router;
