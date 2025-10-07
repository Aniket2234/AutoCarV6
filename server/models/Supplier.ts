import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  gstNumber: { type: String },
  productsSupplied: [{ type: String }],
  paymentTerms: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);
