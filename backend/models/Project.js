const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  techStack:   { type: String, required: true },
  batch:       { type: String, required: true },
  github:        { type: String, default: '' },
  linkedin:      { type: String, default: '' },
  researchPaper: { type: String, default: '' }, // ✅ NEW
  presentation:  { type: String, default: '' }, // ✅ NEW
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);