const mongoose = require('mongoose');

const monitoredIdentifierSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Identifier type is required'],
      enum: {
        values: ['email', 'domain', 'phone', 'username', 'ip_address'],
        message: '{VALUE} is not a supported identifier type',
      },
    },
    value: {
      type: String,
      required: [true, 'Identifier value is required'],
      trim: true,
    },
    valueHash: {
      type: String,
      index: true,
    },
    encryptedValue: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      trim: true,
      maxlength: [100, 'Label cannot exceed 100 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastChecked: {
      type: Date,
      default: null,
    },
    nextCheck: {
      type: Date,
      default: null,
    },
    checkFrequency: {
      type: String,
      enum: ['hourly', 'every6hours', 'daily', 'weekly'],
      default: 'every6hours',
    },
    breachCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastBreachDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['clean', 'breached', 'monitoring', 'paused', 'error', 'active'],
      default: 'monitoring',
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    metadata: {
      source: { type: String, default: 'manual' },
      verifiedAt: Date,
      tags: [String],
    },
    breachHistory: [
      {
        breachId: { type: mongoose.Schema.Types.ObjectId, ref: 'Breach' },
        detectedAt: { type: Date, default: Date.now },
        breachName: String,
        severity: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

monitoredIdentifierSchema.virtual('maskedValue').get(function () {
  const val = this.value;
  if (!val) return '';
  if (this.type === 'email') {
    const [local, domain] = val.split('@');
    if (!domain) return val;
    const maskedLocal = local.length > 2
      ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
      : local[0] + '*';
    return `${maskedLocal}@${domain}`;
  }
  if (this.type === 'phone') {
    return val.length > 4 ? '*'.repeat(val.length - 4) + val.slice(-4) : val;
  }
  if (this.type === 'domain') {
    return val;
  }
  return val.length > 4 ? val.slice(0, 2) + '*'.repeat(val.length - 4) + val.slice(-2) : val;
});

monitoredIdentifierSchema.index({ userId: 1, type: 1, value: 1 }, { unique: true });
monitoredIdentifierSchema.index({ status: 1, nextCheck: 1 });
monitoredIdentifierSchema.index({ isActive: 1 });

module.exports = mongoose.model('MonitoredIdentifier', monitoredIdentifierSchema);
