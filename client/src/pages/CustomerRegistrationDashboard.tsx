import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, CheckCircle, XCircle, Car, User, MapPin, Phone, Mail } from "lucide-react";

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

export default function CustomerRegistrationDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Fetch all customers
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/registration/customers", cityFilter, districtFilter, stateFilter, verifiedFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (cityFilter) params.append("city", cityFilter);
      if (districtFilter) params.append("district", districtFilter);
      if (stateFilter) params.append("state", stateFilter);
      if (verifiedFilter) params.append("isVerified", verifiedFilter);
      
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
                <SelectItem value="" data-testid="option-city-all">All Cities</SelectItem>
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
                <SelectItem value="" data-testid="option-district-all">All Districts</SelectItem>
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
                <SelectItem value="" data-testid="option-state-all">All States</SelectItem>
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
                <SelectItem value="" data-testid="option-verified-all">All Status</SelectItem>
                <SelectItem value="true" data-testid="option-verified-true">Verified</SelectItem>
                <SelectItem value="false" data-testid="option-verified-false">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(cityFilter || districtFilter || stateFilter || verifiedFilter || searchTerm) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setCityFilter("");
                setDistrictFilter("");
                setStateFilter("");
                setVerifiedFilter("");
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

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Customers</CardTitle>
          <CardDescription>
            {filteredCustomers.length} customers found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No customers found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                      <TableCell className="font-mono" data-testid={`text-ref-${customer.id}`}>
                        {customer.referenceCode}
                      </TableCell>
                      <TableCell data-testid={`text-name-${customer.id}`}>{customer.fullName}</TableCell>
                      <TableCell data-testid={`text-mobile-${customer.id}`}>{customer.mobileNumber}</TableCell>
                      <TableCell data-testid={`text-email-${customer.id}`}>{customer.email}</TableCell>
                      <TableCell data-testid={`text-location-${customer.id}`}>
                        {customer.city}, {customer.state}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedCustomer(customer)}
                              data-testid={`button-view-${customer.id}`}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Customer Details</DialogTitle>
                              <DialogDescription>
                                Reference ID: {customer.referenceCode}
                              </DialogDescription>
                            </DialogHeader>

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
                                    <p className="font-medium">{customer.fullName}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Email:</span>
                                    <p className="font-medium">{customer.email}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Mobile:</span>
                                    <p className="font-medium">{customer.mobileNumber}</p>
                                  </div>
                                  {customer.alternativeNumber && (
                                    <div>
                                      <span className="text-muted-foreground">Alt. Number:</span>
                                      <p className="font-medium">{customer.alternativeNumber}</p>
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
                                    <p className="font-medium">{customer.address}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">City/Village:</span>
                                    <p className="font-medium">{customer.city}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Taluka:</span>
                                    <p className="font-medium">{customer.taluka}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">District:</span>
                                    <p className="font-medium">{customer.district}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">State:</span>
                                    <p className="font-medium">{customer.state}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Pin Code:</span>
                                    <p className="font-medium">{customer.pinCode}</p>
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
                                        <div className="grid grid-cols-2 gap-2 text-sm">
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
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
