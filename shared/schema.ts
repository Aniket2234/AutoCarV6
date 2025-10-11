import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referenceCode: text("reference_code").notNull().unique(),
  fullName: text("full_name").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  alternativeNumber: text("alternative_number"),
  email: text("email").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  taluka: text("taluka").notNull(),
  district: text("district").notNull(),
  state: text("state").notNull(),
  pinCode: text("pin_code").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  otp: text("otp"),
  otpExpiresAt: timestamp("otp_expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  referenceCode: true,
  isVerified: true,
  otp: true,
  otpExpiresAt: true,
  createdAt: true,
}).extend({
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  alternativeNumber: z.string().optional(),
  email: z.string().email("Invalid email address"),
  pinCode: z.string().min(6, "Pin code must be 6 digits"),
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  vehicleBrand: text("vehicle_brand").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  yearOfPurchase: integer("year_of_purchase"),
  vehiclePhoto: text("vehicle_photo").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
}).extend({
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  vehicleBrand: z.string().min(1, "Vehicle brand is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  yearOfPurchase: z.number().optional(),
  vehiclePhoto: z.string().min(1, "Vehicle photo is required"),
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
