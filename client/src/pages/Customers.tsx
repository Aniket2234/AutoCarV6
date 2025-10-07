import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User, Car, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DigitalCustomerCard } from "@/components/DigitalCustomerCard";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const { data: customers = [], isLoading, error, refetch: refetchCustomers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: serviceVisits = [], error: visitsError, refetch: refetchVisits } = useQuery({
    queryKey: ["/api/service-visits"],
  });

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
          <Button data-testid="button-add-customer">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
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
                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Visits</p>
                        <p className="text-lg font-bold">{visits.length}</p>
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
              }}
              totalVisits={getCustomerVisits(selectedCustomer._id).length}
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
