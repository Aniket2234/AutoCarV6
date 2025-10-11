import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User, Car, AlertTriangle, Trash2, Edit2, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DigitalCustomerCard } from "@/components/DigitalCustomerCard";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const REFERRAL_SOURCES = [
  'Instagram',
  'Facebook', 
  'WhatsApp',
  'Reference',
  'Website',
  'Walk-in',
  'Other'
];

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
  const { toast } = useToast();

  const initialFormData = {
    name: "",
    phone: "",
    email: "",
    address: "",
    referralSource: "",
    referredBy: "",
    vehicles: [{ regNo: "", make: "", model: "", year: "", photo: "" }]
  };

  const [formData, setFormData] = useState(initialFormData);

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
      setFormData(initialFormData);
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

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/customers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setIsEditDialogOpen(false);
      setEditingCustomer(null);
      setFormData(initialFormData);
      toast({
        title: "Success",
        description: "Customer updated successfully",
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

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/customers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setDeleteCustomerId(null);
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

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const vehiclesData = formData.vehicles
      .filter(v => v.regNo && v.make && v.model && v.year)
      .map(v => ({ ...v, year: parseInt(v.year) }));
    
    createCustomerMutation.mutate({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      referralSource: formData.referralSource,
      referredBy: formData.referredBy,
      vehicles: vehiclesData,
    });
  };

  const handleEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const vehiclesData = formData.vehicles
      .filter(v => v.regNo && v.make && v.model && v.year)
      .map(v => ({ ...v, year: parseInt(v.year) }));
    
    updateCustomerMutation.mutate({
      id: editingCustomer._id,
      data: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        referralSource: formData.referralSource,
        referredBy: formData.referredBy,
        vehicles: vehiclesData,
      }
    });
  };

  const openEditDialog = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
      referralSource: customer.referralSource || "",
      referredBy: customer.referredBy || "",
      vehicles: customer.vehicles?.length > 0 
        ? customer.vehicles.map((v: any) => ({ 
            regNo: v.regNo, 
            make: v.make, 
            model: v.model, 
            year: v.year.toString(),
            photo: v.photo || ""
          }))
        : [{ regNo: "", make: "", model: "", year: "", photo: "" }]
    });
    setIsEditDialogOpen(true);
  };

  const addVehicle = () => {
    setFormData({
      ...formData,
      vehicles: [...formData.vehicles, { regNo: "", make: "", model: "", year: "", photo: "" }]
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

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 4) return "••••••";
    return "••••••" + phone.slice(-4);
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

  const CustomerForm = ({ onSubmit, isEditing = false, isPending = false }: any) => (
    <form onSubmit={onSubmit} className="space-y-4">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="referralSource">How did you hear about us?</Label>
          <Select
            value={formData.referralSource}
            onValueChange={(value) => setFormData({ ...formData, referralSource: value })}
          >
            <SelectTrigger id="referralSource" data-testid="select-referral-source">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {REFERRAL_SOURCES.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="referredBy">Referred By (if applicable)</Label>
          <Input
            id="referredBy"
            value={formData.referredBy}
            onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
            placeholder="Name of referrer"
            data-testid="input-referred-by"
          />
        </div>
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
              <div className="space-y-2 col-span-2">
                <Label htmlFor={`photo-${index}`}>Vehicle Photo URL</Label>
                <Input
                  id={`photo-${index}`}
                  value={vehicle.photo}
                  onChange={(e) => updateVehicle(index, 'photo', e.target.value)}
                  placeholder="Enter image URL"
                  data-testid={`input-vehicle-photo-${index}`}
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
          onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setFormData(initialFormData);
          }}
          data-testid="button-cancel-customer"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isPending}
          data-testid="button-submit-customer"
        >
          {isPending ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Customer' : 'Create Customer')}
        </Button>
      </div>
    </form>
  );

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
                  Add a new customer with their vehicle and referral information
                </DialogDescription>
              </DialogHeader>
              <CustomerForm 
                onSubmit={handleCreateCustomer} 
                isPending={createCustomerMutation.isPending}
              />
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
              const vehicle = customer.vehicles?.[0];
              
              return (
                <Card 
                  key={customer._id} 
                  className="hover-elevate overflow-hidden"
                  data-testid={`card-customer-${customer._id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{customer.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{maskPhone(customer.phone)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {vehicle && (
                      <div className="space-y-2">
                        {vehicle.photo && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                            <img 
                              src={vehicle.photo} 
                              alt={`${vehicle.make} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-xs text-muted-foreground">{vehicle.regNo}</p>
                          </div>
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
                    <div className="flex justify-between items-center pt-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Visits</p>
                        <p className="text-lg font-bold">{customer.visitCount || visits.length}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(customer);
                          }}
                          data-testid={`button-edit-${customer._id}`}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteCustomerId(customer._id);
                          }}
                          data-testid={`button-delete-${customer._id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedCustomer(customer)}
                          data-testid={`button-view-${customer._id}`}
                        >
                          View
                        </Button>
                      </div>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information and vehicle details
            </DialogDescription>
          </DialogHeader>
          <CustomerForm 
            onSubmit={handleEditCustomer}
            isEditing={true}
            isPending={updateCustomerMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCustomerId} onOpenChange={() => setDeleteCustomerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCustomerId && deleteCustomerMutation.mutate(deleteCustomerId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
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
              hidePhone={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
