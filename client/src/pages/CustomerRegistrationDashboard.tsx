import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, CheckCircle, XCircle, Car, User, MapPin, Phone, Mail, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Vehicle Brands
const VEHICLE_BRANDS = [
  "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Kia",
  "Honda", "Toyota", "Ford", "Renault", "Nissan",
  "Volkswagen", "Skoda", "MG", "Jeep", "Citroen"
];

interface Customer {
  id: string;
  referenceCode: string;
  fullName: string;
  mobileNumber: string;
  alternativeNumber: string | null;
  email: string;
  address: string;
  city: string;
  taluka: string;
  district: string;
  state: string;
  pinCode: string;
  isVerified: boolean;
  createdAt: Date;
}

interface Vehicle {
  id: string;
  customerId: string;
  vehicleNumber: string;
  vehicleBrand: string;
  vehicleModel: string;
  yearOfPurchase: number | null;
  vehiclePhoto: string;
  createdAt: Date;
}

const editCustomerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  alternativeNumber: z.string().optional(),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City/Village is required"),
  taluka: z.string().min(1, "Taluka is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z.string().min(6, "Pin code must be 6 digits"),
  isVerified: z.boolean(),
  vehicleNumber: z.string().optional(),
  vehicleBrand: z.string().optional(),
  vehicleModel: z.string().optional(),
  yearOfPurchase: z.string().optional(),
  vehiclePhoto: z.string().optional(),
});

// Customer Card Component
function CustomerCard({ 
  customer, 
  isAdmin, 
  onEdit, 
  onDelete,
  onViewDetails 
}: { 
  customer: Customer; 
  isAdmin: boolean; 
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onViewDetails: (customer: Customer) => void;
}) {
  // Fetch vehicles for this customer
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/registration/customers", customer.id, "vehicles"],
    queryFn: async () => {
      const response = await fetch(`/api/registration/customers/${customer.id}/vehicles`, {
        credentials: "include",
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  const primaryVehicle = vehicles[0];

  return (
    <Card className="overflow-hidden border-2 border-gray-300 dark:border-gray-700" data-testid={`card-customer-${customer.id}`}>
      <CardContent className="p-0">
        {/* Vehicle Image */}
        {primaryVehicle?.vehiclePhoto && (
          <div className="w-full h-48 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 flex items-center justify-center">
            <img 
              src={primaryVehicle.vehiclePhoto} 
              alt={`${primaryVehicle.vehicleBrand} ${primaryVehicle.vehicleModel}`} 
              className="h-full w-full object-contain"
              data-testid={`img-vehicle-card-${customer.id}`}
            />
          </div>
        )}
        
        {/* Customer Details */}
        <div className="p-4 space-y-3">
          {/* Header with name and status */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg" data-testid={`text-name-${customer.id}`}>
                {customer.fullName}
              </h3>
              <p className="text-xs text-muted-foreground font-mono" data-testid={`text-ref-${customer.id}`}>
                {customer.referenceCode}
              </p>
            </div>
            {customer.isVerified ? (
              <Badge className="bg-green-600" data-testid={`badge-verified-${customer.id}`}>
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary" data-testid={`badge-pending-${customer.id}`}>
                <XCircle className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>

          {/* Vehicle Info */}
          {primaryVehicle && (
            <div className="flex items-center gap-2 text-sm">
              <Car className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                {primaryVehicle.vehicleBrand} {primaryVehicle.vehicleModel}
              </span>
              <span className="text-muted-foreground">• {primaryVehicle.vehicleNumber}</span>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span data-testid={`text-mobile-${customer.id}`}>{customer.mobileNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="truncate" data-testid={`text-email-${customer.id}`}>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span data-testid={`text-location-${customer.id}`}>{customer.city}, {customer.state}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewDetails(customer)}
              data-testid={`button-view-${customer.id}`}
            >
              View Details
            </Button>
            
            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(customer)}
                  data-testid={`button-edit-${customer.id}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-delete-${customer.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the customer "{customer.fullName}" and all associated vehicles. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(customer.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CustomerRegistrationDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  const isAdmin = user?.role === 'Admin';

  // Fetch all customers
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/registration/customers", cityFilter, districtFilter, stateFilter, verifiedFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (cityFilter && cityFilter !== "all") params.append("city", cityFilter);
      if (districtFilter && districtFilter !== "all") params.append("district", districtFilter);
      if (stateFilter && stateFilter !== "all") params.append("state", stateFilter);
      if (verifiedFilter && verifiedFilter !== "all") params.append("isVerified", verifiedFilter);
      
      const response = await fetch(`/api/registration/customers?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  // Fetch customer vehicles when selected
  const { data: customerVehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/registration/customers", selectedCustomer?.id, "vehicles"],
    queryFn: async () => {
      if (!selectedCustomer?.id) return [];
      const response = await fetch(`/api/registration/customers/${selectedCustomer.id}/vehicles`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      return response.json();
    },
    enabled: !!selectedCustomer?.id,
  });
  
  // Fetch editing customer vehicles
  const { data: editingVehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/registration/customers", editingCustomer?.id, "vehicles"],
    queryFn: async () => {
      if (!editingCustomer?.id) return [];
      const response = await fetch(`/api/registration/customers/${editingCustomer.id}/vehicles`, {
        credentials: "include",
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!editingCustomer?.id,
  });

  // Edit form
  const editForm = useForm<z.infer<typeof editCustomerSchema>>({
    resolver: zodResolver(editCustomerSchema),
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
      isVerified: false,
      vehicleNumber: "",
      vehicleBrand: "",
      vehicleModel: "",
      yearOfPurchase: "",
      vehiclePhoto: "",
    },
  });

  // Update form when editing customer or vehicles change
  useEffect(() => {
    if (editingCustomer) {
      const primaryVehicle = editingVehicles[0];
      editForm.reset({
        fullName: editingCustomer.fullName,
        mobileNumber: editingCustomer.mobileNumber,
        alternativeNumber: editingCustomer.alternativeNumber || "",
        email: editingCustomer.email,
        address: editingCustomer.address,
        city: editingCustomer.city,
        taluka: editingCustomer.taluka,
        district: editingCustomer.district,
        state: editingCustomer.state,
        pinCode: editingCustomer.pinCode,
        isVerified: editingCustomer.isVerified,
        vehicleNumber: primaryVehicle?.vehicleNumber || "",
        vehicleBrand: primaryVehicle?.vehicleBrand || "",
        vehicleModel: primaryVehicle?.vehicleModel || "",
        yearOfPurchase: primaryVehicle?.yearOfPurchase?.toString() || "",
        vehiclePhoto: primaryVehicle?.vehiclePhoto || "",
      });
      setEditingVehicle(primaryVehicle || null);
    }
  }, [editingCustomer, editingVehicles, editForm]);

  // Edit customer mutation
  const editMutation = useMutation({
    mutationFn: async (data: z.infer<typeof editCustomerSchema>) => {
      if (!editingCustomer) throw new Error("No customer selected");
      
      const customerData = {
        fullName: data.fullName,
        mobileNumber: data.mobileNumber,
        alternativeNumber: data.alternativeNumber,
        email: data.email,
        address: data.address,
        city: data.city,
        taluka: data.taluka,
        district: data.district,
        state: data.state,
        pinCode: data.pinCode,
        isVerified: data.isVerified,
      };
      
      await apiRequest("PATCH", `/api/registration/customers/${editingCustomer.id}`, customerData);
      
      if (editingVehicle && data.vehicleNumber) {
        const vehicleData = {
          vehicleNumber: data.vehicleNumber,
          vehicleBrand: data.vehicleBrand,
          vehicleModel: data.vehicleModel,
          yearOfPurchase: data.yearOfPurchase ? parseInt(data.yearOfPurchase) : null,
          vehiclePhoto: data.vehiclePhoto,
        };
        
        await apiRequest("PATCH", `/api/registration/vehicles/${editingVehicle.id}`, vehicleData);
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registration/customers"] });
      setEditDialogOpen(false);
      setEditingCustomer(null);
      setEditingVehicle(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Customer and vehicle updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer",
        variant: "destructive",
      });
    },
  });

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: async (customerId: string) => {
      return apiRequest("DELETE", `/api/registration/customers/${customerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registration/customers"] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  // Filter customers by search term
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.fullName.toLowerCase().includes(searchLower) ||
      customer.mobileNumber.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.referenceCode.toLowerCase().includes(searchLower)
    );
  });

  // Get unique values for filters
  const cities = Array.from(new Set(customers.map(c => c.city))).filter(Boolean);
  const districts = Array.from(new Set(customers.map(c => c.district))).filter(Boolean);
  const states = Array.from(new Set(customers.map(c => c.state))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Registration Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all registered customers and their vehicles
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter customers by various criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, mobile, email, or reference code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
              className="flex-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger data-testid="select-filter-city">
                <SelectValue placeholder="Filter by City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-city-all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city} data-testid={`option-city-${city.toLowerCase().replace(/\s+/g, '-')}`}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger data-testid="select-filter-district">
                <SelectValue placeholder="Filter by District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-district-all">All Districts</SelectItem>
                {districts.map(district => (
                  <SelectItem key={district} value={district} data-testid={`option-district-${district.toLowerCase().replace(/\s+/g, '-')}`}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger data-testid="select-filter-state">
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-state-all">All States</SelectItem>
                {states.map(state => (
                  <SelectItem key={state} value={state} data-testid={`option-state-${state.toLowerCase().replace(/\s+/g, '-')}`}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger data-testid="select-filter-verified">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-verified-all">All Status</SelectItem>
                <SelectItem value="true" data-testid="option-verified-true">Verified</SelectItem>
                <SelectItem value="false" data-testid="option-verified-false">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(cityFilter && cityFilter !== "all" || districtFilter && districtFilter !== "all" || stateFilter && stateFilter !== "all" || verifiedFilter && verifiedFilter !== "all" || searchTerm) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setCityFilter("all");
                setDistrictFilter("all");
                setStateFilter("all");
                setVerifiedFilter("all");
                setSearchTerm("");
              }}
              data-testid="button-clear-filters"
            >
              Clear All Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-customers">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-verified-customers">
              {customers.filter(c => c.isVerified).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-pending-customers">
              {customers.filter(c => !c.isVerified).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Registered Customers</h2>
            <p className="text-muted-foreground">{filteredCustomers.length} customers found</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No customers found matching your criteria
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                isAdmin={isAdmin}
                onEdit={(customer) => {
                  setEditingCustomer(customer);
                  setEditDialogOpen(true);
                }}
                onDelete={(customerId) => deleteMutation.mutate(customerId)}
                onViewDetails={(customer) => setSelectedCustomer(customer)}
              />
            ))}
          </div>
        )}

        {/* Customer Details Dialog */}
        <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>
                Reference ID: {selectedCustomer?.referenceCode}
              </DialogDescription>
            </DialogHeader>

            {selectedCustomer && (
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="flex items-center gap-2 font-semibold mb-3">
                    <User className="w-4 h-4" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{selectedCustomer.fullName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mobile:</span>
                      <p className="font-medium">{selectedCustomer.mobileNumber}</p>
                    </div>
                    {selectedCustomer.alternativeNumber && (
                      <div>
                        <span className="text-muted-foreground">Alt. Number:</span>
                        <p className="font-medium">{selectedCustomer.alternativeNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="flex items-center gap-2 font-semibold mb-3">
                    <MapPin className="w-4 h-4" />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Address:</span>
                      <p className="font-medium">{selectedCustomer.address}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">City/Village:</span>
                      <p className="font-medium">{selectedCustomer.city}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Taluka:</span>
                      <p className="font-medium">{selectedCustomer.taluka}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">District:</span>
                      <p className="font-medium">{selectedCustomer.district}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">State:</span>
                      <p className="font-medium">{selectedCustomer.state}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pin Code:</span>
                      <p className="font-medium">{selectedCustomer.pinCode}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div>
                  <h3 className="flex items-center gap-2 font-semibold mb-3">
                    <Car className="w-4 h-4" />
                    Registered Vehicles ({customerVehicles.length})
                  </h3>
                  {customerVehicles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No vehicles registered yet</p>
                  ) : (
                    <div className="space-y-3">
                      {customerVehicles.map((vehicle) => (
                        <div key={vehicle.id} className="p-3 border rounded-lg">
                          <div className="flex gap-4">
                            {vehicle.vehiclePhoto && (
                              <div className="flex-shrink-0">
                                <img 
                                  src={vehicle.vehiclePhoto} 
                                  alt={`${vehicle.vehicleBrand} ${vehicle.vehicleModel}`} 
                                  className="w-24 h-24 object-cover rounded-md border"
                                  data-testid={`img-vehicle-${vehicle.id}`}
                                />
                              </div>
                            )}
                            <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Number:</span>
                                <p className="font-medium">{vehicle.vehicleNumber}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Brand & Model:</span>
                                <p className="font-medium">{vehicle.vehicleBrand} {vehicle.vehicleModel}</p>
                              </div>
                              {vehicle.yearOfPurchase && (
                                <div>
                                  <span className="text-muted-foreground">Year:</span>
                                  <p className="font-medium">{vehicle.yearOfPurchase}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => editMutation.mutate(data))} className="space-y-4">
              <FormField
                control={editForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-fullName" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-mobileNumber" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="alternativeNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternative Number</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-alternativeNumber" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} data-testid="input-edit-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City/Village</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="taluka"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taluka</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-taluka" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-district" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="pinCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pin Code</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-pinCode" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {editingVehicle && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="flex items-center gap-2 font-semibold mb-4">
                      <Car className="w-4 h-4" />
                      Vehicle Information
                    </h3>
                  </div>

                  <FormField
                    control={editForm.control}
                    name="vehicleNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="MH12AB1234" className="uppercase" data-testid="input-edit-vehicleNumber" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="vehicleBrand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Brand</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-vehicleBrand">
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
                      control={editForm.control}
                      name="vehicleModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Model</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-edit-vehicleModel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="yearOfPurchase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year of Purchase</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="2024" data-testid="input-edit-yearOfPurchase" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="vehiclePhoto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Photo</FormLabel>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <FormControl>
                              <Input {...field} placeholder="https://... or upload below" data-testid="input-edit-vehiclePhoto" />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('vehicle-photo-upload-edit')?.click()}
                              data-testid="button-upload-vehicle-photo"
                            >
                              Upload
                            </Button>
                          </div>
                          <input
                            id="vehicle-photo-upload-edit"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  field.onChange(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          {field.value && (
                            <div className="relative w-full h-32 border rounded-md overflow-hidden bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30">
                              <img
                                src={field.value}
                                alt="Vehicle preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={editForm.control}
                name="isVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Verification Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Mark this customer as verified
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-edit-isVerified"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setEditingCustomer(null);
                    editForm.reset();
                  }}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {editMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
