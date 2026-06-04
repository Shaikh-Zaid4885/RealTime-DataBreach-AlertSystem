const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/generate', reportController.generateReport);
router.get('/legal-advisories', reportController.getLegalAdvisories);
router.get('/compliance/:breachId', reportController.getComplianceGuidance);

module.exports = router;
