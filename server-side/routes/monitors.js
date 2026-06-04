const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', monitorController.getMonitors);
router.post('/', monitorController.addMonitor);
router.post('/check', monitorController.checkInstant);
router.post('/bulk', monitorController.bulkUpload);
router.delete('/:id', monitorController.deleteMonitor);
router.post('/:id/scan', monitorController.scanMonitor);
router.patch('/:id/toggle', monitorController.toggleMonitor);

module.exports = router;
