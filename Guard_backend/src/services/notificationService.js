const Notification = require("../models/Notification");
const { emitToUser } = require("../socket");

const notifyUser = async (
  recipientUserId,
  {
    title,
    message,
    category = 'General',
    targetScreen = null,
    targetParams = null
  }) => {
  const notification = await Notification.create({
    recipient: recipientUserId,
    title,
    message,
    category,
    targetScreen,
    targetParams,
  });

  emitToUser(recipientUserId.toString(), 'notification:new', notification);

  return notification;
};

module.exports = {
  notifyUser
}