const mongoose = require('mongoose');

const breachSchema = new mongoose.Schema(
  {
    breachId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Breach name is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
      lowercase: true,
    },
    breachDate: {
      type: Date,
      required: [true, 'Breach date is required'],
    },
    discoveredDate: {
      type: Date,
      default: Date.now,
    },
    addedDate: {
      type: Date,
      default: Date.now,
    },
    modifiedDate: {
      type: Date,
      default: Date.now,
    },
    pwnCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    logoPath: {
      type: String,
      default: '',
    },
    dataClasses: [
      {
        type: String,
        trim: true,
      },
    ],
    exposedData: [
      {
        type: String,
        trim: true,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSensitive: {
      type: Boolean,
      default: false,
    },
    isRetired: {
      type: Boolean,
      default: false,
    },
    isSpamList: {
      type: Boolean,
      default: false,
    },
    isFabricated: {
      type: Boolean,
      default: false,
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'],
      default: 'MEDIUM',
    },
    severityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    source: {
      type: String,
      enum: ['xposedornot', 'threat_intel', 'manual', 'dark_web', 'public_disclosure'],
      default: 'xposedornot',
    },
    affectedIdentifiers: [
      {
        identifierId: { type: mongoose.Schema.Types.ObjectId, ref: 'MonitoredIdentifier' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        identifierValue: String,
        identifierType: String,
      },
    ],
    legalImplications: {
      applicableLaws: [
        {
          law: String,
          section: String,
          description: String,
          jurisdiction: String,
        },
      ],
      notificationDeadline: Date,
      potentialFines: String,
      complianceStatus: {
        type: String,
        enum: ['compliant', 'non_compliant', 'pending_review', 'not_applicable'],
        default: 'pending_review',
      },
    },
    analysis: {
      nlpSummary: String,
      riskFactors: [String],
      attackVector: String,
      impactAssessment: String,
      recommendations: [String],
    },
    tags: [String],
    rawData: {
      type: mongoose.Schema.Types.Mixed,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

breachSchema.virtual('age').get(function () {
  if (!this.breachDate) return null;
  const diffMs = Date.now() - this.breachDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});

breachSchema.virtual('affectedUserCount').get(function () {
  return this.affectedIdentifiers ? this.affectedIdentifiers.length : 0;
});

breachSchema.index({ severity: 1 });
breachSchema.index({ breachDate: -1 });
breachSchema.index({ domain: 1 });
breachSchema.index({ source: 1 });
breachSchema.index({ 'affectedIdentifiers.userId': 1 });
breachSchema.index({ dataClasses: 1 });
breachSchema.index({ name: 1 });
breachSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Breach', breachSchema);
