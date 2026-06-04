const express = require('express');
const router = express.Router();
const breachController = require('../controllers/breachController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', breachController.getBreaches);
router.get('/xposed-all', breachController.getXposedAllBreaches);
router.get('/recent', breachController.getRecentBreaches);
router.get('/search', breachController.searchBreaches);
router.get('/my-breaches', breachController.getUserBreaches);
router.post('/sync', breachController.syncBreaches);
router.get('/:id', breachController.getBreachById);

module.exports = router;
