const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  startTrip,
  endTrip
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTrips)
  .post(createTrip);

router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

router.post('/:id/start', startTrip);
router.post('/:id/end', endTrip);

module.exports = router;
