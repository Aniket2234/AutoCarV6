import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User, Car, AlertTriangle, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DigitalCustomerCard } from "@/components/DigitalCustomerCard";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    vehicles: [{ regNo: "", make: "", model: "", year: "" }]
  });

  const { data: customers = [], isLoading, error, refetch: refetchCustomers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: serviceVisits = [], error: visitsError, refetch: refetchVisits } = useQuery({
    queryKey: ["/api/service-visits"],
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/customers', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        vehicles: [{ regNo: "", make: "", model: "", year: "" }]
      });
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const vehiclesData = formData.vehicles
      .filter(v => v.regNo && v.make && v.model && v.year)
      .map(v => ({ ...v, year: parseInt(v.year) }));
    
    createCustomerMutation.mutate({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      vehicles: vehiclesData,
    });
  };

  const addVehicle = () => {
    setFormData({
      ...formData,
      vehicles: [...formData.vehicles, { regNo: "", make: "", model: "", year: "" }]
    });
  };

  const removeVehicle = (index: number) => {
    setFormData({
      ...formData,
      vehicles: formData.vehicles.filter((_, i) => i !== index)
    });
  };

  const updateVehicle = (index: number, field: string, value: string) => {
    const newVehicles = [...formData.vehicles];
    newVehicles[index] = { ...newVehicles[index], [field]: value };
    setFormData({ ...formData, vehicles: newVehicles });
  };

  const filteredCustomers = customers.filter((customer: any) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCustomerVisits = (customerId: string) => {
    return serviceVisits.filter((visit: any) => 
      visit.customerId?._id === customerId || visit.customerId === customerId
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load customers</h3>
              <p className="text-muted-foreground mb-4">
                {(error as Error)?.message || 'An error occurred while fetching customers'}
              </p>
              <Button onClick={() => refetchCustomers()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customers</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-customer">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Add a new customer and their vehicle information
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Customer Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="input-customer-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      data-testid="input-customer-phone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    data-testid="input-customer-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    data-testid="input-customer-address"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Vehicles</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVehicle}
                      data-testid="button-add-vehicle"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </div>

                  {formData.vehicles.map((vehicle, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Vehicle {index + 1}</h4>
                        {formData.vehicles.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVehicle(index)}
                            data-testid={`button-remove-vehicle-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`regNo-${index}`}>Registration Number</Label>
                          <Input
                            id={`regNo-${index}`}
                            value={vehicle.regNo}
                            onChange={(e) => updateVehicle(index, 'regNo', e.target.value)}
                            data-testid={`input-vehicle-regno-${index}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`make-${index}`}>Make</Label>
                          <Input
                            id={`make-${index}`}
                            value={vehicle.make}
                            onChange={(e) => updateVehicle(index, 'make', e.target.value)}
                            data-testid={`input-vehicle-make-${index}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`model-${index}`}>Model</Label>
                          <Input
                            id={`model-${index}`}
                            value={vehicle.model}
                            onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                            data-testid={`input-vehicle-model-${index}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`year-${index}`}>Year</Label>
                          <Input
                            id={`year-${index}`}
                            type="number"
                            value={vehicle.year}
                            onChange={(e) => updateVehicle(index, 'year', e.target.value)}
                            data-testid={`input-vehicle-year-${index}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel-customer"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createCustomerMutation.isPending}
                    data-testid="button-submit-customer"
                  >
                    {createCustomerMutation.isPending ? 'Creating...' : 'Create Customer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        {visitsError && (
          <Card className="border-warning mb-4">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <p className="text-sm">Failed to load service visit history</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchVisits()}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {filteredCustomers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer: any) => {
              const visits = visitsError ? [] : getCustomerVisits(customer._id);
              
              return (
                <Card 
                  key={customer._id} 
                  className="hover-elevate cursor-pointer" 
                  onClick={() => setSelectedCustomer(customer)}
                  data-testid={`card-customer-${customer._id}`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{customer.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {customer.vehicles && customer.vehicles.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {customer.vehicles[0].make} {customer.vehicles[0].model}
                          </p>
                          <p className="text-xs text-muted-foreground">{customer.vehicles[0].regNo}</p>
                        </div>
                      </div>
                    )}
                    {customer.loyaltyTier && customer.loyaltyTier !== 'Bronze' && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {customer.loyaltyTier} • {customer.discountPercentage}% OFF
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Visits</p>
                        <p className="text-lg font-bold">{customer.visitCount || visits.length}</p>
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-view-${customer._id}`}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : customers.length > 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No customers match your search criteria</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No customers found. Add your first customer to get started.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <DigitalCustomerCard
              customer={{
                name: selectedCustomer.name,
                phone: selectedCustomer.phone,
                email: selectedCustomer.email,
                vehicle: selectedCustomer.vehicles?.[0] || {
                  regNo: 'N/A',
                  make: 'N/A',
                  model: 'N/A',
                  year: 0,
                },
                loyaltyTier: selectedCustomer.loyaltyTier,
                discountPercentage: selectedCustomer.discountPercentage,
                loyaltyPoints: selectedCustomer.loyaltyPoints,
                totalSpent: selectedCustomer.totalSpent,
              }}
              totalVisits={selectedCustomer.visitCount || getCustomerVisits(selectedCustomer._id).length}
              lastHandler="N/A"
              currentHandler="N/A"
              recentVisits={[]}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
