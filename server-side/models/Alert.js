const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    breachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Breach',
      index: true,
    },
    identifierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MonitoredIdentifier',
    },
    type: {
      type: String,
      required: true,
      enum: [
        'breach_detected',
        'new_exposure',
        'severity_upgrade',
        'dark_web_mention',
        'password_compromised',
        'credential_leak',
        'compliance_deadline',
        'threat_intel',
        'system',
        'weekly_digest',
      ],
    },
    title: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Alert message is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'acknowledged', 'resolved', 'dismissed'],
      default: 'unread',
    },
    priority: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
    },
    channels: {
      email: { sent: { type: Boolean, default: false }, sentAt: Date, error: String },
      sms: { sent: { type: Boolean, default: false }, sentAt: Date, error: String },
      push: { sent: { type: Boolean, default: false }, sentAt: Date, error: String },
      inApp: { sent: { type: Boolean, default: true }, sentAt: { type: Date, default: Date.now } },
      websocket: { sent: { type: Boolean, default: false }, sentAt: Date },
    },
    metadata: {
      affectedEmail: String,
      breachName: String,
      breachDomain: String,
      exposedDataTypes: [String],
      source: String,
      actionUrl: String,
      actionLabel: String,
    },
    recommendations: [
      {
        action: String,
        priority: { type: String, enum: ['immediate', 'high', 'medium', 'low'] },
        description: String,
        completed: { type: Boolean, default: false },
        completedAt: Date,
      },
    ],
    legalInfo: {
      applicableLaws: [String],
      deadlines: [
        {
          law: String,
          deadline: Date,
          description: String,
        },
      ],
    },
    readAt: Date,
    acknowledgedAt: Date,
    resolvedAt: Date,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

alertSchema.virtual('isExpired').get(function () {
  return this.expiresAt && this.expiresAt < new Date();
});

alertSchema.virtual('ageInHours').get(function () {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60));
});

alertSchema.pre('save', function (next) {
  const severityPriorityMap = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFO: 1 };
  if (this.isModified('severity')) {
    this.priority = severityPriorityMap[this.severity] || 3;
  }
  next();
});

alertSchema.index({ userId: 1, status: 1 });
alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ type: 1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Alert', alertSchema);
