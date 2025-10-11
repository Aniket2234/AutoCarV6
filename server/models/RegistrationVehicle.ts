import mongoose from 'mongoose';

const registrationVehicleSchema = new mongoose.Schema({
  customerId: { type: String, required: true, index: true },
  vehicleNumber: { type: String, required: true },
  vehicleBrand: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  yearOfPurchase: { type: Number, default: null },
  vehiclePhoto: { type: String, required: true },
}, { timestamps: true });

export const RegistrationVehicle = mongoose.models.RegistrationVehicle || mongoose.model('RegistrationVehicle', registrationVehicleSchema);
