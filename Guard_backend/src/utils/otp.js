const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtp = async (target, otp) => {
  return true;
};

module.exports = {
  generateOtp,
  sendOtp
}