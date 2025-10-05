const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    phone: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    role: {
      type: String,
      enum: [
        'Farmer',
        'Farm Manager',
        'Veterinarian',
        'Pharmacist',
        'Dairy Management',
        'Customer',
        'Government'
      ],
      default: 'Farmer'
    },
    name: { type: String },
    farmName: { type: String },
    area: { type: String, required: true },

    // New fields for registration/auth
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

// Encrypt password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
