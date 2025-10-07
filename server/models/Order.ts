import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'partial', 'due'],
    default: 'due'
  },
  paidAmount: { type: Number, default: 0 },
  salespersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  invoiceNumber: { type: String, unique: true },
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
