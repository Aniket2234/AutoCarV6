import { type User, type InsertUser, type Customer, type InsertCustomer, type Vehicle, type InsertVehicle } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer operations
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByMobile(mobile: string): Promise<Customer | undefined>;
  getAllCustomers(filters?: { city?: string; district?: string; state?: string; isVerified?: boolean }): Promise<Customer[]>;
  updateCustomerOTP(id: string, otp: string, expiresAt: Date): Promise<void>;
  verifyCustomer(id: string): Promise<void>;
  updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | undefined>;
  
  // Vehicle operations
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehiclesByCustomerId(customerId: string): Promise<Vehicle[]>;
  getVehicleByNumber(vehicleNumber: string): Promise<Vehicle | undefined>;
  updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private customers: Map<string, Customer>;
  private vehicles: Map<string, Vehicle>;
  private customerCounter: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.vehicles = new Map();
    this.customerCounter = 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Customer operations
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    
    // State code mapping for Indian states (RTO codes)
    const stateCodeMap: Record<string, string> = {
      "Andhra Pradesh": "AP", "Arunachal Pradesh": "AR", "Assam": "AS", "Bihar": "BR",
      "Chhattisgarh": "CG", "Goa": "GA", "Gujarat": "GJ", "Haryana": "HR",
      "Himachal Pradesh": "HP", "Jharkhand": "JH", "Karnataka": "KA", "Kerala": "KL",
      "Madhya Pradesh": "MP", "Maharashtra": "MH", "Manipur": "MN", "Meghalaya": "ML",
      "Mizoram": "MZ", "Nagaland": "NL", "Odisha": "OD", "Punjab": "PB",
      "Rajasthan": "RJ", "Sikkim": "SK", "Tamil Nadu": "TN", "Telangana": "TS",
      "Tripura": "TR", "Uttar Pradesh": "UP", "Uttarakhand": "UK", "West Bengal": "WB"
    };
    
    const stateCode = stateCodeMap[insertCustomer.state] || insertCustomer.state.substring(0, 2).toUpperCase();
    const referenceCode = `CUST-${stateCode}-${String(this.customerCounter).padStart(6, '0')}`;
    this.customerCounter++;
    
    const customer: Customer = {
      ...insertCustomer,
      id,
      referenceCode,
      alternativeNumber: insertCustomer.alternativeNumber || null,
      isVerified: false,
      otp: null,
      otpExpiresAt: null,
      createdAt: new Date(),
    };
    
    this.customers.set(id, customer);
    return customer;
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByMobile(mobile: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      (customer) => customer.mobileNumber === mobile,
    );
  }

  async getAllCustomers(filters?: { city?: string; district?: string; state?: string; isVerified?: boolean }): Promise<Customer[]> {
    let customers = Array.from(this.customers.values());
    
    if (filters) {
      if (filters.city) {
        customers = customers.filter(c => c.city.toLowerCase() === filters.city!.toLowerCase());
      }
      if (filters.district) {
        customers = customers.filter(c => c.district.toLowerCase() === filters.district!.toLowerCase());
      }
      if (filters.state) {
        customers = customers.filter(c => c.state.toLowerCase() === filters.state!.toLowerCase());
      }
      if (filters.isVerified !== undefined) {
        customers = customers.filter(c => c.isVerified === filters.isVerified);
      }
    }
    
    return customers;
  }

  async updateCustomerOTP(id: string, otp: string, expiresAt: Date): Promise<void> {
    const customer = this.customers.get(id);
    if (customer) {
      customer.otp = otp;
      customer.otpExpiresAt = expiresAt;
      this.customers.set(id, customer);
    }
  }

  async verifyCustomer(id: string): Promise<void> {
    const customer = this.customers.get(id);
    if (customer) {
      customer.isVerified = true;
      customer.otp = null;
      customer.otpExpiresAt = null;
      this.customers.set(id, customer);
    }
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (customer) {
      const updated = { ...customer, ...data };
      this.customers.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Vehicle operations
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = {
      ...insertVehicle,
      id,
      yearOfPurchase: insertVehicle.yearOfPurchase || null,
      createdAt: new Date(),
    };
    
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehiclesByCustomerId(customerId: string): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(
      (vehicle) => vehicle.customerId === customerId,
    );
  }

  async getVehicleByNumber(vehicleNumber: string): Promise<Vehicle | undefined> {
    return Array.from(this.vehicles.values()).find(
      (vehicle) => vehicle.vehicleNumber.toUpperCase() === vehicleNumber.toUpperCase(),
    );
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (vehicle) {
      const updated = { ...vehicle, ...data };
      this.vehicles.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteVehicle(id: string): Promise<void> {
    this.vehicles.delete(id);
  }
}

export const storage = new MemStorage();
