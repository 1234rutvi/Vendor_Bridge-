import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['success', 'warning', 'error', 'info', 'details', 'danger'],
    required: true
  },
  vendor: {
    type: String,
    required: true,
    trim: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: String,
    required: true
  },
  itemsCount: {
    type: Number,
    default: 0
  },
  method: {
    type: String,
    required: true,
    trim: true
  },
  rawPayload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

const Log = mongoose.model('Log', logSchema);
export default Log;
