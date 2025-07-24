const crypto = require('crypto');

function verifySignature(orderId, paymentId, razorpaySignature, secret) {
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(orderId + '|' + paymentId)
    .digest('hex');

  return generatedSignature === razorpaySignature;
}

module.exports = verifySignature;
