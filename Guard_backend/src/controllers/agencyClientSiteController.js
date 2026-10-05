const ClientProfile = require('../models/ClientProfile');
const User = require('../models/User');
const Site = require('../models/Site');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');

const getClients = asyncHandler(async (req, res) => {
  const sites = await Site.find({ agency: req.user.agency }).populate({
    path: 'client',
    populate: { path: 'user', select: 'name email phone avatarUrl' },
  });

  const clientMap = new Map();
  sites.forEach((s) => {
    if (s.client) clientMap.set(s.client._id.toString(), s.client);
  });

  return sendSuccess(res, 200, 'Clients fetched', { clients: Array.from(clientMap.values()) });
});

const getClientDetails = asyncHandler(async (req, res) => {
  const client = await ClientProfile.findById(req.params.id).populate('user', 'name email phone avatarUrl');
  if (!client) throw new ApiError(404, 'Client not found');

  const sites = await Site.find({ agency: req.user.agency, client: client._id });
  return sendSuccess(res, 200, 'Client details fetched', { client, sites });
});

const addClient = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const user = await User.create({
    name,
    email,
    phone,
    password: password || 'Client@123',
    role: 'client'
  });
  const client = await ClientProfile.create({ user: user._id });
  return sendSuccess(res, 201, 'Client added', { client });
});


const updateClient = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  const client = await ClientProfile.findById(req.params.id);
  if (!client) throw new ApiError(404, 'Client not found');

  await User.findByIdAndUpdate(client.user,
    {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone })
    });
  return sendSuccess(res, 200, 'Client updated', { client });
});

const getSites = asyncHandler(async (req, res) => {
  const sites = await Site.find({ agency: req.user.agency }).populate({
    path: 'client',
    populate: { path: 'user', select: 'name' },
  });
  return sendSuccess(res, 200, 'Sites fetched', { sites });
});

const getSiteDetails = asyncHandler(async (req, res) => {
  const site = await Site.findOne({
    _id: req.params.id,
    agency: req.user.agency
  }).populate('client');
  if (!site) throw new ApiError(404, 'Site not found');
  return sendSuccess(res, 200, 'Site details fetched', { site });
});

const addSite = asyncHandler(async (req, res) => {
  const { name, address, latitude, longitude, clientId, contactPerson, contactPhone, geofenceRadiusMeters } = req.body;
  const site = await Site.create({
    agency: req.user.agency,
    client: clientId || undefined,
    name,
    address,
    latitude,
    longitude,
    contactPerson,
    contactPhone,
    geofenceRadiusMeters,
  });
  return sendSuccess(res, 201, 'Site added', { site });
});

const updateSite = asyncHandler(async (req, res) => {
  const site = await Site.findOneAndUpdate({
    _id: req.params.id,
    agency: req.user.agency
  },
    req.body,
    {
      new: true,
      runValidators: true,
    });
  if (!site) throw new ApiError(404, 'Site not found');
  return sendSuccess(res, 200, 'Site updated', { site });
});

const updateSiteGeofence = asyncHandler(async (req, res) => {
  const { geofenceRadiusMeters, latitude, longitude } = req.body;
  const site = await Site.findOneAndUpdate(
    { _id: req.params.id, agency: req.user.agency },
    { ...(geofenceRadiusMeters && { geofenceRadiusMeters }), ...(latitude && { latitude }), ...(longitude && { longitude }) },
    { new: true }
  );
  if (!site) throw new ApiError(404, 'Site not found');
  return sendSuccess(res, 200, 'Geofence settings updated', { site });
});

module.exports = {
  getClients,
  getClientDetails,
  addClient,
  updateClient,
  getSites,
  getSiteDetails,
  addSite,
  updateSite,
  updateSiteGeofence,
};
