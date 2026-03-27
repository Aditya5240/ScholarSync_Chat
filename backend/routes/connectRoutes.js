const express = require('express');
const router = express.Router();
const { connectUser } = require('../controllers/connectController');

// ScholarSync calls: GET /api/connect?subject=greedy
router.get('/', connectUser);

module.exports = router;
