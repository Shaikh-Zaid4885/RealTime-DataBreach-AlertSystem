const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', analyticsController.getOverview);
router.get('/trends', analyticsController.getTrends);
router.get('/data-types', analyticsController.getDataTypes);
router.get('/org-report', analyticsController.getOrgReport);

module.exports = router;
