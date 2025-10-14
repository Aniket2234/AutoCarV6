import mongoose from 'mongoose';

const registrationVehicleSchema = new mongoose.Schema({
  customerId: { type: String, required: true, index: true },
  vehicleNumber: { type: String, required: false },
  vehicleBrand: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  customModel: { type: String, default: null },
  yearOfPurchase: { type: Number, default: null },
  vehiclePhoto: { type: String, required: true },
  isNew: { type: Boolean, default: false },
  chassisNumber: { type: String, default: null },
  selectedParts: { type: [String], default: [] },
}, { timestamps: true });

export const RegistrationVehicle = mongoose.models.RegistrationVehicle || mongoose.model('RegistrationVehicle', registrationVehicleSchema);
