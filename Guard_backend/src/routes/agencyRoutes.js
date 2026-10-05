const express = require('express');
const router = express.Router();

const misc = require('../controllers/agencyMiscController');
const requestCtrl = require('../controllers/agencyRequestController');
const guardCtrl = require('../controllers/agencyGuardController');
const clientSiteCtrl = require('../controllers/agencyClientSiteController');
const opsCtrl = require('../controllers/agencyOperationsController');

const protect = require('../middleware/auth');
const allowRoles = require('../middleware/role');
const upload = require('../middleware/upload');

const AGENCY_ROLES = ['agency_admin', 'operations_manager', 'supervisor'];

router.use(protect, allowRoles(...AGENCY_ROLES));

router.get('/dashboard', misc.getDashboard);
router.get('/profile', misc.getAgencyProfile);
router.put('/profile', allowRoles('agency_admin'), upload.single('logo'), misc.updateAgencyProfile);
router.get('/team', misc.getTeamMembers);
router.post('/team', allowRoles('agency_admin'), misc.addTeamMember);
router.get('/reports', misc.getReports);
router.get('/notifications', misc.getNotifications);
router.patch('/notifications/:id/read', misc.markNotificationRead);
router.patch('/notifications/read-all', misc.markAllNotificationsRead);

router.get('/requests', requestCtrl.getRequest);
router.get('/requests/:id', requestCtrl.getRequestDetails);
router.patch('/requests/:id/clarify', requestCtrl.requestClarification);
router.patch('/requests/:id/reject', requestCtrl.rejectRequest);
router.get('/requests/:id/eligible-guards', requestCtrl.getEligibleGuards);
router.post('/requests/:id/assign', requestCtrl.assignGuards);

router.get('/guards', guardCtrl.getGuard);
router.get('/guards/:id', guardCtrl.getGuardProfile);
// Updated: add guard ke saath documents upload (max 5 files)
router.post('/guards', allowRoles('agency_admin', 'operations_manager'), upload.array('documents', 5), guardCtrl.addGuard);
router.put('/guards/:id', allowRoles('agency_admin', 'operations_manager'), guardCtrl.updateGuard);
router.get('/guards/:id/availability', guardCtrl.getGuardAvailability);
router.put('/guards/:id/availability', guardCtrl.updateGuardAvailability);
router.get('/guards/:id/documents', guardCtrl.getGuardDocuments);
router.post('/guards/:id/documents', upload.single('file'), guardCtrl.uploadGuardDocument);

router.patch('/guards/:id/documents/:docId/verify', allowRoles('agency_admin', 'operations_manager'), guardCtrl.verifyGuardDocument);
router.delete('/guards/:id/documents/:docId', allowRoles('agency_admin', 'operations_manager'), guardCtrl.deleteGuardDocument);
router.get('/guards/:id/attendance', guardCtrl.getGuardAttendance);
router.get('/guards/:id/shifts', guardCtrl.getGuardShiftHistory);

router.get('/clients', clientSiteCtrl.getClients);
router.get('/clients/:id', clientSiteCtrl.getClientDetails);
router.post('/clients', clientSiteCtrl.addClient);
router.put('/clients/:id', clientSiteCtrl.updateClient);
router.get('/sites', clientSiteCtrl.getSites);
router.get('/sites/:id', clientSiteCtrl.getSiteDetails);
router.post('/sites', clientSiteCtrl.addSite);
router.put('/sites/:id', clientSiteCtrl.updateSite);
router.put('/sites/:id/geofence', clientSiteCtrl.updateSiteGeofence);

router.get('/shifts', opsCtrl.getShifts);
router.get('/shifts/:id', opsCtrl.getShiftDetails);
router.post('/shifts', allowRoles('agency_admin', 'operations_manager'), opsCtrl.createShift);
router.put('/shifts/:id', allowRoles('agency_admin', 'operations_manager'), opsCtrl.updateShift);
router.patch('/shifts/:id/cancel', allowRoles('agency_admin', 'operations_manager'), opsCtrl.cancelShift);
router.get('/attendance', opsCtrl.getAttendanceMonitor);
router.get('/live-map', opsCtrl.getLiveGuardsMap);
router.get('/incidents', opsCtrl.getIncidents);
router.get('/incidents/:id', opsCtrl.getIncidentDetails);
router.patch('/incidents/:id', opsCtrl.updateIncidentStatus);

module.exports = router;
