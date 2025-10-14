import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Inventory Manager', 'Sales Executive', 'HR Manager', 'Service Staff'],
    required: true 
  },
  contact: { type: String, required: true },
  email: { type: String },
  department: { type: String },
  salary: { type: Number },
  joiningDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
