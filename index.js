require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const animalsRoutes = require('./routes/animals');
const treatmentsRoutes = require('./routes/treatments');
const billsRoutes = require('./routes/bills');
const farmerRoutes = require('./routes/farmer');
const farmManagerRoutes = require('./routes/farmManager');
const veterinarianRoutes = require('./routes/veterinarian');
const dairyManagementRoutes = require('./routes/dairyManagement');
const customerRoutes = require('./routes/customer');

const app = express();
app.use(cors());
app.use(express.json());

// static for uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// connect mongo
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/amu_farm', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=>console.log('Mongo connected'))
  .catch(err=>console.error('Mongo error', err));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalsRoutes);
app.use('/api/treatments', treatmentsRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/farm-manager', farmManagerRoutes);
app.use('/api/veterinarian', veterinarianRoutes);
app.use('/api/dairy-management', dairyManagementRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/government', require('./routes/government'));
app.use("/api/auth", authRoutes);

app.get('/api/health', (req,res)=>res.json({ok:true}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server listening ${PORT}`));
