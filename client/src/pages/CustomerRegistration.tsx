import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, Car, User, MapPin } from "lucide-react";

// States in India - predefined list
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

// Vehicle Brands
const VEHICLE_BRANDS = [
  "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Kia",
  "Honda", "Toyota", "Ford", "Renault", "Nissan",
  "Volkswagen", "Skoda", "MG", "Jeep", "Citroen"
];

// Customer form schema
const customerFormSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  alternativeNumber: z.string().optional(),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  taluka: z.string().min(1, "Taluka is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z.string().min(6, "Pin code must be 6 digits"),
});

// Vehicle form schema
const vehicleFormSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  vehicleBrand: z.string().min(1, "Vehicle brand is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  yearOfPurchase: z.string().optional(),
  vehiclePhoto: z.string().min(1, "Vehicle photo is required"),
  isNew: z.string().min(1, "Please select vehicle condition"),
  chassisNumber: z.string().optional(),
}).refine((data) => {
  if (data.isNew === "true" && !data.chassisNumber) {
    return false;
  }
  return true;
}, {
  message: "Chassis number is required for new vehicles",
  path: ["chassisNumber"],
});

type CustomerFormData = z.infer<typeof customerFormSchema>;
type VehicleFormData = z.infer<typeof vehicleFormSchema>;

export default function CustomerRegistration() {
  const { toast } = useToast();
  const [step, setStep] = useState<"customer" | "otp" | "vehicle" | "success">("customer");
  const [customerId, setCustomerId] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [customerData, setCustomerData] = useState<any>(null);
  const [vehicleData, setVehicleData] = useState<any>(null);

  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      fullName: "",
      mobileNumber: "",
      alternativeNumber: "",
      email: "",
      address: "",
      city: "",
      taluka: "",
      district: "",
      state: "",
      pinCode: "",
    },
  });

  const vehicleForm = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      vehicleNumber: "",
      vehicleBrand: "",
      vehicleModel: "",
      yearOfPurchase: "",
      vehiclePhoto: "",
      isNew: "",
      chassisNumber: "",
    },
  });

  // Register customer mutation
  const registerCustomer = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const response = await apiRequest("POST", "/api/registration/customers", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setCustomerId(data.customerId);
      if (data.otp) setOtp(data.otp); // For development
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: "Please check your mobile for the OTP",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register customer",
        variant: "destructive",
      });
    },
  });

  // Verify OTP mutation
  const verifyOTP = useMutation({
    mutationFn: async ({ customerId, otp }: { customerId: string; otp: string }) => {
      const response = await apiRequest("POST", "/api/registration/verify-otp", { customerId, otp });
      return await response.json();
    },
    onSuccess: (data) => {
      setCustomerData(data.customer);
      setStep("vehicle");
      toast({
        title: "Verification Successful",
        description: "Now add your vehicle details",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    },
  });

  // Register vehicle mutation
  const registerVehicle = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const response = await apiRequest("POST", "/api/registration/vehicles", {
        ...data,
        customerId,
        yearOfPurchase: data.yearOfPurchase ? parseInt(data.yearOfPurchase) : undefined,
        isNew: data.isNew === "true",
        chassisNumber: data.isNew === "true" ? data.chassisNumber : undefined,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setVehicleData(data.vehicle);
      setCustomerData(data.customer);
      setStep("success");
      toast({
        title: "Registration Complete!",
        description: "Vehicle registered successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Vehicle Registration Failed",
        description: error.message || "Failed to register vehicle",
        variant: "destructive",
      });
    },
  });

  const onCustomerSubmit = (data: CustomerFormData) => {
    registerCustomer.mutate(data);
  };

  const onOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOTP.mutate({ customerId, otp: otpInput });
  };

  const onVehicleSubmit = (data: VehicleFormData) => {
    registerVehicle.mutate(data);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        vehicleForm.setValue("vehiclePhoto", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Customer Registration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Register your vehicle with us for exclusive services and offers
          </p>
        </div>

        {/* Step 1: Customer Information */}
        {step === "customer" && (
          <Card data-testid="card-customer-form">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-6 h-6" />
                <CardTitle>Customer Information</CardTitle>
              </div>
              <CardDescription>Please provide your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...customerForm}>
                <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={customerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your full name" data-testid="input-full-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={customerForm.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="10-digit mobile number" data-testid="input-mobile" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={customerForm.control}
                      name="alternativeNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alternative Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Optional" data-testid="input-alt-mobile" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={customerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="your@email.com" data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={customerForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Street address" data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={customerForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City/Village *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="City name" data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={customerForm.control}
                      name="taluka"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taluka *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Taluka name" data-testid="input-taluka" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={customerForm.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="District name" data-testid="input-district" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={customerForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-state">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INDIAN_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={customerForm.control}
                      name="pinCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pin Code *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="6-digit pin code" data-testid="input-pincode" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerCustomer.isPending}
                    data-testid="button-submit-customer"
                  >
                    {registerCustomer.isPending ? "Submitting..." : "Submit & Verify"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <Card data-testid="card-otp-verification">
            <CardHeader>
              <CardTitle>OTP Verification</CardTitle>
              <CardDescription>
                Enter the 6-digit OTP sent to your mobile
                {otp && <span className="block mt-2 text-sm font-mono bg-yellow-100 dark:bg-yellow-900 p-2 rounded">Development OTP: {otp}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onOTPSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Enter OTP *</label>
                  <Input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="text-center text-2xl tracking-widest"
                    data-testid="input-otp"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={verifyOTP.isPending || otpInput.length !== 6}
                  data-testid="button-verify-otp"
                >
                  {verifyOTP.isPending ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Vehicle Information */}
        {step === "vehicle" && (
          <Card data-testid="card-vehicle-form">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Car className="w-6 h-6" />
                <CardTitle>Vehicle Information</CardTitle>
              </div>
              <CardDescription>Add your vehicle details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...vehicleForm}>
                <form onSubmit={vehicleForm.handleSubmit(onVehicleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={vehicleForm.control}
                      name="vehicleNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Number *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="MH12AB1234" className="uppercase" data-testid="input-vehicle-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={vehicleForm.control}
                      name="vehicleBrand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Brand *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-vehicle-brand">
                                <SelectValue placeholder="Select brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {VEHICLE_BRANDS.map((brand) => (
                                <SelectItem key={brand} value={brand}>
                                  {brand}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={vehicleForm.control}
                      name="vehicleModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Model *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Innova Crysta" data-testid="input-vehicle-model" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={vehicleForm.control}
                      name="yearOfPurchase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year of Purchase</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="2023" type="number" data-testid="input-year" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={vehicleForm.control}
                      name="isNew"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Condition *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-vehicle-condition">
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">New Vehicle</SelectItem>
                              <SelectItem value="false">Used Vehicle</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {vehicleForm.watch("isNew") === "true" && (
                    <FormField
                      control={vehicleForm.control}
                      name="chassisNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chassis Number *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter chassis number" className="uppercase" data-testid="input-chassis-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={vehicleForm.control}
                    name="vehiclePhoto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Photo *</FormLabel>
                        <FormControl>
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            data-testid="input-vehicle-photo"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerVehicle.isPending}
                    data-testid="button-submit-vehicle"
                  >
                    {registerVehicle.isPending ? "Registering..." : "Complete Registration"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success Message */}
        {step === "success" && customerData && vehicleData && (
          <Card data-testid="card-success" className="bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-center text-2xl">Registration Successful!</CardTitle>
              <CardDescription className="text-center">
                Your vehicle has been registered successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-3">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your Reference ID</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-reference-code">
                    {customerData.referenceCode}
                  </p>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Customer Details:</h3>
                  <p data-testid="text-customer-name">Name: {customerData.fullName}</p>
                  <p data-testid="text-customer-mobile">Mobile: {customerData.mobileNumber}</p>
                  <p data-testid="text-customer-email">Email: {customerData.email}</p>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Vehicle Details:</h3>
                  <p data-testid="text-vehicle-number">Number: {vehicleData.vehicleNumber}</p>
                  <p data-testid="text-vehicle-info">{vehicleData.vehicleBrand} {vehicleData.vehicleModel}</p>
                  {vehicleData.yearOfPurchase && <p>Year: {vehicleData.yearOfPurchase}</p>}
                </div>
              </div>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>You will receive SMS, WhatsApp, and Email confirmations shortly.</p>
                <p className="mt-2">We'll notify you about offers, services & discounts soon!</p>
              </div>

              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="w-full"
                data-testid="button-register-another"
              >
                Register Another Customer
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
