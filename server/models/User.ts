import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Inventory Manager', 'Sales Executive', 'HR Manager', 'Service Staff'],
    default: 'Service Staff'
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
