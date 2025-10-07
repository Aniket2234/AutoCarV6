import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['IN', 'OUT'], required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export const InventoryTransaction = mongoose.models.InventoryTransaction || 
  mongoose.model('InventoryTransaction', inventoryTransactionSchema);
