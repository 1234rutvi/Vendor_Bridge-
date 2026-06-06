import mongoose from 'mongoose';

const rfqSchema = new mongoose.Schema({
  rfqNo: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  budget: {
    type: Number,
    required: true
  },
  deadline: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Bidding Open', 'Bids Received', 'Closed'],
    default: 'Draft'
  },
  vendorCount: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const RFQ = mongoose.model('RFQ', rfqSchema);
export default RFQ;
