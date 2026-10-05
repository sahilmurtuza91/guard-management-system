const express = require('express');
const router = express.Router();

const misc = require('../controllers/userMiscController');
const requestCtrl = require('../controllers/userRequestController');
const upload = require('../middleware/upload');

const protect = require('../middleware/auth');
const allowRoles = require('../middleware/role');

router.use(protect, allowRoles('client'));

router.get('/dashboard', misc.getDashboard);
router.get('/categories', misc.getCategories);
router.get('/hire-options', misc.getHireOptions);

router.get('/addresses', misc.getAddresses);
router.post('/addresses', misc.addAddress);
router.delete('/addresses/:addressId', misc.deleteAddress);

router.get('/profile', misc.getProfile);
router.put('/profile', upload.single('avatar'), misc.updateProfile);

router.post('/support/issues', upload.single('image'), misc.raiseIssue);
router.post('/sos', misc.triggerSOS);

router.get('/notifications', misc.getNotifications);
router.patch('/notifications/:id/read', misc.markNotificationRead);
router.patch('/notifications/read-all', misc.markAllNotificationsRead);

router.post('/requests', requestCtrl.createRequest);
router.get('/requests', requestCtrl.getMyRequests);
router.get('/requests/:id', requestCtrl.getRequestDetails);
router.get('/requests/:id/tracking', requestCtrl.getRequestTracking);
router.patch('/requests/:id/modify', requestCtrl.modifyRequest);
router.patch('/requests/:id/cancel', requestCtrl.cancelRequest);
router.post('/requests/:id/replacement', requestCtrl.requestReplacement);
router.post('/requests/:id/rate', requestCtrl.rateRequest);

module.exports = router;
