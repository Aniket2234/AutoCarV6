import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  regNo: { type: String, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
}, { _id: false });

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  vehicles: [vehicleSchema],
  loyaltyPoints: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  visitCount: { type: Number, default: 0 },
  loyaltyTier: { 
    type: String, 
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  discountPercentage: { type: Number, default: 0 },
}, { timestamps: true });

customerSchema.methods.calculateLoyaltyTier = function() {
  if (this.visitCount >= 20) {
    this.loyaltyTier = 'Platinum';
    this.discountPercentage = 15;
  } else if (this.visitCount >= 10) {
    this.loyaltyTier = 'Gold';
    this.discountPercentage = 10;
  } else if (this.visitCount >= 5) {
    this.loyaltyTier = 'Silver';
    this.discountPercentage = 5;
  } else {
    this.loyaltyTier = 'Bronze';
    this.discountPercentage = 0;
  }
  this.loyaltyPoints = this.visitCount * 10;
};

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
