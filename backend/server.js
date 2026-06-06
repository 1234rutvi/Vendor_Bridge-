import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import User from './models/User.js';
import Vendor from './models/Vendor.js';
import RFQ from './models/RFQ.js';
import Log from './models/Log.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('⚡ Connected securely to MongoDB Atlas');
    await seedDatabase();
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
  });

// --- Database Seeding Helper ---
async function seedDatabase() {
  try {
    // 1. Seed Users (Add a default Admin and Officer if empty)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding default users...');
      await User.create([
        { email: 'admin@vendorbridge.com', password: 'password123', firstName: 'Priya', lastName: 'Shah', role: 'admin' },
        { email: 'officer@vendorbridge.com', password: 'password123', firstName: 'Elena', lastName: 'Rostova', role: 'officer' }
      ]);
    }

    // 2. Seed Vendors (matching the 8 initial list in App.jsx + extra to align with dashboard numbers)
    const vendorCount = await Vendor.countDocuments();
    if (vendorCount === 0) {
      console.log('🌱 Seeding initial vendors database...');
      await Vendor.create([
        { name: 'Infra Supplies Pvt ltd', category: 'Constructions', gstNo: '27AABCS1429BzO', contactNo: '9876543210', status: 'Active', isActive: true, platform: 'Custom REST', endpoint: 'https://api.infrasupplies.com/v1', lastSync: '10 mins ago', productsCount: 154 },
        { name: 'Tech Core LTD', category: 'IT', gstNo: '27AABCS1429BzO', contactNo: '8765432109', status: 'Active', isActive: true, platform: 'Custom REST', endpoint: 'https://api.techcore.com/v1', lastSync: '12 mins ago', productsCount: 320 },
        { name: 'FastLog Transport', category: 'Logistics', gstNo: '27AABCS1429BzO', contactNo: '7654321098', status: 'Blocked', isActive: false, platform: 'Custom REST', endpoint: 'https://api.fastlog.com/v1', lastSync: 'Never synced', productsCount: 0 },
        { name: 'Amazon US Marketplace', category: 'Office Supplies', gstNo: '27AABCS1429BzO', contactNo: '6543210987', status: 'Active', isActive: true, platform: 'Amazon', endpoint: 'https://sellingpartnerapi-na.amazon.com', lastSync: '25 mins ago', productsCount: 4892 },
        { name: 'Shopify Storefront (Retail)', category: 'Retail', gstNo: '27AABCS1429BzO', contactNo: '5432109876', status: 'Active', isActive: true, platform: 'Shopify', endpoint: 'https://our-app.myshopify.com/admin/api/2024-04', lastSync: '40 mins ago', productsCount: 1253 },
        { name: 'Walmart Wholesale Portal', category: 'Wholesale', gstNo: '27AABCS1429BzO', contactNo: '4321098765', status: 'Active', isActive: true, platform: 'Custom REST', endpoint: 'https://api.walmart.com/v3/items', lastSync: '1 hour ago', productsCount: 8120 },
        { name: 'WooCommerce UK Distributor', category: 'Distribution', gstNo: '27AABCS1429BzO', contactNo: '3210987654', status: 'Pending', isActive: true, platform: 'WooCommerce', endpoint: 'https://distributor.woo.co.uk/wp-json/wc/v3', lastSync: '2 hours ago', productsCount: 20 },
        { name: 'Target Supply Chain', category: 'Logistics', gstNo: '27AABCS1429BzO', contactNo: '2109876543', status: 'Blocked', isActive: false, platform: 'Custom REST', endpoint: 'https://target-edi.partnerapi.com/v1', lastSync: 'Never synced', productsCount: 0 }
      ]);
    }

    // 3. Seed RFQs
    const rfqCount = await RFQ.countDocuments();
    if (rfqCount === 0) {
      console.log('🌱 Seeding initial RFQs...');
      await RFQ.create([
        { rfqNo: 'RFQ-2026-008', title: 'High-Capacity SSDs & RAM Blocks', budget: 15000, deadline: '2026-06-12', status: 'Bidding Open', vendorCount: 4, description: 'Bulk storage blocks for server infrastructure upgrades.' },
        { rfqNo: 'RFQ-2026-009', title: 'Ergonomic Standing Desks Phase 2', budget: 6500, deadline: '2026-06-18', status: 'Draft', vendorCount: 2, description: 'Motorized standing desks for workplace ergonomics.' },
        { rfqNo: 'RFQ-2026-010', title: 'Custom Aluminum Extrusion Brackets', budget: 24000, deadline: '2026-06-10', status: 'Bids Received', vendorCount: 5, description: 'High-grade aluminum frames for structural mounting assemblies.' }
      ]);
    }

    // 4. Seed Audit Logs
    const logCount = await Log.countDocuments();
    if (logCount === 0) {
      console.log('🌱 Seeding initial sync logs...');
      await Log.create([
        {
          status: 'success',
          vendor: 'Amazon US Marketplace',
          action: 'Inventory Pull & Sync',
          message: 'Pulled 250 product listings. Verified skus and synchronized quantity levels in Odoo (125 items updated).',
          timestamp: '2026-06-06 09:35:12',
          itemsCount: 250,
          method: 'API Webhook (Real-time)',
          rawPayload: { status: 'success', total_records: 250, odoo_updated: 125, response_time_ms: 182, request_id: 'amz_req_99824' }
        },
        {
          status: 'warning',
          vendor: 'Shopify Storefront (Retail)',
          action: 'Price Synchronization',
          message: 'V_SKU_009 matched but price value is 0.00. Maintained previous list_price value in Odoo to prevent sales loss.',
          timestamp: '2026-06-06 09:23:45',
          itemsCount: 1,
          method: 'Scheduled Cron Job',
          rawPayload: { warning: 'zero_price_detected', product_id: 'V_SKU_009', action: 'skipped_price_update', previous_price: 24.99 }
        },
        {
          status: 'error',
          vendor: 'WooCommerce UK Distributor',
          action: 'Fetch SKU Catalog',
          message: 'Handshake connection failed. API Access Token has expired or lacks correct read scopes.',
          timestamp: '2026-06-06 08:45:00',
          itemsCount: 0,
          method: 'Manual Diagnostics Check',
          rawPayload: { error_code: 'UNAUTHORIZED_401', message: 'Token signature invalid or expired. Check key settings.', endpoint_accessed: '/wc/v3/products' }
        },
        {
          status: 'success',
          vendor: 'Walmart Wholesale Portal',
          action: 'Order Back-Sync',
          message: 'Linked and synched order references for 14 new customer invoices from Walmart API into Odoo Sales Orders.',
          timestamp: '2026-06-06 08:15:30',
          itemsCount: 14,
          method: 'Scheduled Cron Job',
          rawPayload: { status: 'success', orders_imported: 14, sales_orders_created: 14, odoo_db_commit: 'SUCCESS' }
        }
      ]);
    }
  } catch (error) {
    console.error('⚠️ Seeding error:', error.message);
  }
}

// ==========================================
// --- API ENDPOINT ROUTES ---
// ==========================================

// --- 1. USER AUTHENTICATION ENDPOINTS ---

// Register User
app.post('/api/auth/signup', async (appReq, appRes) => {
  try {
    const { email, password, firstName, lastName, role } = appReq.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return appRes.status(400).json({ message: 'User with this email already exists.' });
    }

    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || 'officer'
    });

    await newUser.save();

    // Respond with user profile (excluding password)
    const userResponse = {
      id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role
    };

    appRes.status(201).json(userResponse);
  } catch (error) {
    appRes.status(500).json({ message: 'Server registration error.', error: error.message });
  }
});

// Login User
app.post('/api/auth/login', async (appReq, appRes) => {
  try {
    const { email, password } = appReq.body;
    
    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      return appRes.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    // Compare Password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return appRes.status(400).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    // Respond with session user structure
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };

    appRes.status(200).json(userResponse);
  } catch (error) {
    appRes.status(500).json({ message: 'Server logging error.', error: error.message });
  }
});

// Forgot / Reset Password
app.post('/api/auth/forgot', async (appReq, appRes) => {
  try {
    const { email, newPassword } = appReq.body;

    const user = await User.findOne({ email });
    if (!user) {
      return appRes.status(404).json({ message: 'User with this email not registered.' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    appRes.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    appRes.status(500).json({ message: 'Password recovery error.', error: error.message });
  }
});

// --- 2. VENDORS DIRECTORY ENDPOINTS ---

// Fetch all vendors
app.get('/api/vendors', async (appReq, appRes) => {
  try {
    const vendorsList = await Vendor.find().sort({ createdAt: -1 });
    appRes.status(200).json(vendorsList);
  } catch (error) {
    appRes.status(500).json({ message: 'Failed to retrieve vendors.', error: error.message });
  }
});

// Create Vendor Connection
app.post('/api/vendors', async (appReq, appRes) => {
  try {
    const newVendor = new Vendor(appReq.body);
    await newVendor.save();
    appRes.status(201).json(newVendor);
  } catch (error) {
    appRes.status(500).json({ message: 'Failed to create vendor connection.', error: error.message });
  }
});

// Update Vendor properties / Trigger sync stats
app.put('/api/vendors/:id', async (appReq, appRes) => {
  try {
    const updated = await Vendor.findByIdAndUpdate(
      appReq.params.id,
      { $set: appReq.body },
      { new: true }
    );
    if (!updated) {
      return appRes.status(404).json({ message: 'Vendor not found.' });
    }
    appRes.status(200).json(updated);
  } catch (error) {
    appRes.status(500).json({ message: 'Failed to update vendor properties.', error: error.message });
  }
});

// Delete Vendor Connection
app.delete('/api/vendors/:id', async (appReq, appRes) => {
  try {
    const deleted = await Vendor.findByIdAndDelete(appReq.params.id);
    if (!deleted) {
      return appRes.status(404).json({ message: 'Vendor not found.' });
    }
    appRes.status(200).json({ message: 'Vendor connection removed successfully.' });
  } catch (error) {
    appRes.status(500).json({ message: 'Failed to delete vendor connection.', error: error.message });
  }
});

// --- 3. RFQ DOCUMENT ENDPOINTS ---

// Fetch all RFQs
app.get('/api/rfqs', async (appReq, appRes) => {
  try {
    const rfqsList = await RFQ.find().sort({ createdAt: -1 });
    appRes.status(200).json(rfqsList);
  } catch (error) {
    appRes.status(500).json({ message: 'Failed to retrieve RFQs.', error: error.message });
  }
});

// Create RFQ
app.post('/api/rfqs', async (appReq, appRes) => {
  try {
    const newRfq = new RFQ(appReq.body);
    await newRfq.save();
    appRes.status(201).json(newRfq);
  } catch (error) {
    appRes.status(500).json({ message: 'Failed to save RFQ.', error: error.message });
  }
});

// --- 4. AUDIT SYNC LOGS ENDPOINTS ---

// Fetch Audit logs
app.get('/api/logs', async (appReq, appRes) => {
  try {
    const logsList = await Log.find().sort({ createdAt: -1 });
    appRes.status(200).json(logsList);
  } catch (error) {
    appRes.status(500).json({ message: 'Failed to retrieve logs.', error: error.message });
  }
});

// Create Audit Log
app.post('/api/logs', async (appReq, appRes) => {
  try {
    const newLog = new Log(appReq.body);
    await newLog.save();
    appRes.status(201).json(newLog);
  } catch (error) {
    appRes.status(500).json({ message: 'Failed to write audit log.', error: error.message });
  }
});

// Launch server listening
app.listen(PORT, () => {
  console.log(`🚀 Server listening and running on port ${PORT}`);
});
