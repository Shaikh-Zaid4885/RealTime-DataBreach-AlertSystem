const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', alertController.getAlerts);
router.patch('/read-all', alertController.markAllAsRead);
router.patch('/:id/read', alertController.markAsRead);
router.patch('/:id/action', alertController.markActionCompleted);
router.patch('/resolve-breach/:breachId', alertController.resolveBreach);
router.delete('/:id', alertController.deleteAlert);

module.exports = router;
