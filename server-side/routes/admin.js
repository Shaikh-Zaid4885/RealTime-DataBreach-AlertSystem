const express = require('express');
const { 
  getSystemStats, 
  getAllUsers, 
  deleteUser, 
  getUserDetails, 
  deleteMonitor, 
  deleteAlert,
  updateUserRole 
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

router.get('/users/:id/details', getUserDetails);
router.delete('/monitors/:id', deleteMonitor);
router.delete('/alerts/:id', deleteAlert);

module.exports = router;
