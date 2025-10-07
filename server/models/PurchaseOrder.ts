import mongoose from 'mongoose';

const purchaseOrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, unique: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  items: [purchaseOrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'received', 'cancelled'],
    default: 'pending'
  },
  orderDate: { type: Date, default: Date.now },
  expectedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

purchaseOrderSchema.pre('save', function(next) {
  if (!this.poNumber) {
    this.poNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

export const PurchaseOrder = mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', purchaseOrderSchema);
