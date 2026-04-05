const crypto = require('crypto');

const hashAnonKey = (req) => {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    'unknown-ip';

  const ua = req.headers['user-agent'] || 'unknown-ua';
  return crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex');
};

module.exports = hashAnonKey;
