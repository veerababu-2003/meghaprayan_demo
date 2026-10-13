const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, getUserStats, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getUserStats);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.delete('/account', deleteAccount);

module.exports = router;
