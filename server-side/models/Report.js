const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    type: {
      type: String,
      required: true,
      enum: [
        'breach_summary',
        'risk_assessment',
        'compliance_audit',
        'executive_summary',
        'incident_response',
        'weekly_digest',
        'monthly_report',
        'custom',
      ],
    },
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed', 'archived'],
      default: 'generating',
    },
    format: {
      type: String,
      enum: ['json', 'pdf', 'csv', 'html'],
      default: 'json',
    },
    dateRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    summary: {
      totalBreaches: { type: Number, default: 0 },
      criticalBreaches: { type: Number, default: 0 },
      highBreaches: { type: Number, default: 0 },
      mediumBreaches: { type: Number, default: 0 },
      lowBreaches: { type: Number, default: 0 },
      totalAffectedIdentifiers: { type: Number, default: 0 },
      uniqueDataTypesExposed: [String],
      averageSeverityScore: { type: Number, default: 0 },
      riskTrend: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable', 'unknown'],
        default: 'unknown',
      },
    },
    sections: [
      {
        title: String,
        order: Number,
        content: mongoose.Schema.Types.Mixed,
        type: {
          type: String,
          enum: ['text', 'chart', 'table', 'list', 'metric'],
        },
      },
    ],
    breaches: [
      {
        breachId: { type: mongoose.Schema.Types.ObjectId, ref: 'Breach' },
        name: String,
        severity: String,
        date: Date,
        exposedData: [String],
      },
    ],
    complianceAnalysis: {
      overallStatus: {
        type: String,
        enum: ['compliant', 'non_compliant', 'partial', 'not_assessed'],
        default: 'not_assessed',
      },
      frameworks: [
        {
          name: String,
          status: String,
          findings: [String],
          recommendations: [String],
        },
      ],
    },
    recommendations: [
      {
        category: String,
        priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
        title: String,
        description: String,
        estimatedEffort: String,
      },
    ],
    legalReferences: [
      {
        law: String,
        jurisdiction: String,
        relevantSections: [String],
        implications: String,
      },
    ],
    metadata: {
      generatedBy: { type: String, default: 'system' },
      generationTimeMs: Number,
      dataPointsAnalyzed: Number,
      version: { type: String, default: '1.0' },
    },
    filePath: String,
    fileSize: Number,
    downloadCount: {
      type: Number,
      default: 0,
    },
    sharedWith: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        sharedAt: { type: Date, default: Date.now },
        permission: { type: String, enum: ['view', 'download'], default: 'view' },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reportSchema.index({ userId: 1, type: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ 'dateRange.start': 1, 'dateRange.end': 1 });

module.exports = mongoose.model('Report', reportSchema);
