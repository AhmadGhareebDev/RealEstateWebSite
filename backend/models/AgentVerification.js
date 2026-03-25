const mongoose = require('mongoose');

const agentVerificationSchema = new mongoose.Schema({
  licenseNumber: { type: String, required: true },
  state: { type: String, required: true, uppercase: true, trim: true },
  agentName: { type: String, required: true, trim: true },   
  status: { type: String, enum: ['active', 'expired', 'suspended'], default: 'active' },
  expiresAt: { type: Date }
}, { 
  timestamps: true,
  indexes: [{ licenseNumber: 1, state: 1 }, { unique: true }]
});

module.exports = mongoose.model('AgentVerification', agentVerificationSchema);