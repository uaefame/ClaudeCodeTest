const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: String,
  pdfText: String,

  grade: {
    type: String,
    enum: ['elementary', 'middle', 'high', 'university'],
    default: 'high'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  contentTypes: {
    type: [String],
    default: ['visual', 'audio', 'readwrite', 'kinesthetic']
  },

  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'error'],
    default: 'uploading'
  },
  progress: {
    type: Number,
    default: 0
  },
  step: String,
  error: String,

  results: {
    report: mongoose.Schema.Types.Mixed,
    interactiveLearning: mongoose.Schema.Types.Mixed,
    audioScript: mongoose.Schema.Types.Mixed,
    infographic: mongoose.Schema.Types.Mixed
  },

  rerunVersions: {
    report: [mongoose.Schema.Types.Mixed],
    interactiveLearning: [mongoose.Schema.Types.Mixed],
    audioScript: [mongoose.Schema.Types.Mixed],
    infographic: [mongoose.Schema.Types.Mixed]
  },
  rerunStatus: mongoose.Schema.Types.Mixed,

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    default: null
  }
});

uploadSchema.index({ userId: 1, createdAt: -1 });
uploadSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

uploadSchema.pre('save', function(next) {
  if (!this.userId && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Upload', uploadSchema);
