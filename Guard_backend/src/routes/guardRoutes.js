const express = require('express');
const router = express.Router();

const guard = require('../controllers/guardController');
const protect = require('../middleware/auth');
const allowRoles = require('../middleware/role');
const upload = require('../middleware/upload');

router.use(protect, allowRoles('guard'));

router.get('/dashboard', guard.getDashboard);

router.get('/shifts', guard.getShifts);
router.get('/shifts/:id', guard.getShiftDetails);

router.post('/attendance/check-in', guard.checkIn);
router.post('/attendance/check-out', guard.checkOut);
router.post('/attendance/location-ping', guard.locationPing);
router.get('/attendance', guard.getAttendanceHistory);

router.get('/incidents', guard.getIncidents);
router.post('/incidents', upload.single('image'), guard.createIncident);
router.get('/incidents/:id', guard.getIncidentDetails);

router.get('/profile', guard.getProfile);
router.put('/profile', upload.single('avatar'), guard.updateProfile);

router.get('/notifications', guard.getNotifications);
router.patch('/notifications/:id/read', guard.markNotificationRead);
router.patch('/notifications/read-all', guard.markAllNotificationRead);

module.exports = router;
