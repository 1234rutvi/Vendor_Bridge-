import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  gstNo: {
    type: String,
    required: true,
    trim: true
  },
  contactNo: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Blocked'],
    default: 'Pending'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  platform: {
    type: String,
    required: true,
    trim: true
  },
  endpoint: {
    type: String,
    required: true,
    trim: true
  },
  lastSync: {
    type: String,
    default: 'Never synced'
  },
  productsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
