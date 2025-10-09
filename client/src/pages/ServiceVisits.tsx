import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ServiceWorkflowCard } from "@/components/ServiceWorkflowCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistance } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ServiceVisits() {
  const { toast } = useToast();
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [serviceForm, setServiceForm] = useState({
    customerId: "",
    vehicleReg: "",
    handlerId: "",
    notes: "",
  });

  const { data: serviceVisits = [], isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ["/api/service-visits"],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  const { data: employees = [] } = useQuery<any[]>({
    queryKey: ["/api/employees"],
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/service-visits', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-visits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      setIsServiceDialogOpen(false);
      setServiceForm({ customerId: "", vehicleReg: "", handlerId: "", notes: "" });
      toast({
        title: "Success",
        description: "Service visit created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service visit",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/service-visits/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-visits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      setIsEditDialogOpen(false);
      setSelectedService(null);
      toast({
        title: "Success",
        description: "Service status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service status",
        variant: "destructive",
      });
    },
  });

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceForm.customerId || !serviceForm.vehicleReg || !serviceForm.handlerId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    createServiceMutation.mutate(serviceForm);
  };

  const handleServiceClick = (service: any) => {
    setSelectedService(service);
    setIsEditDialogOpen(true);
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (selectedService) {
      updateServiceMutation.mutate({
        id: selectedService._id,
        status: newStatus,
      });
    }
  };

  const servicesByStage = {
    inquired: serviceVisits.filter((v: any) => v.status === 'inquired'),
    working: serviceVisits.filter((v: any) => v.status === 'working'),
    waiting: serviceVisits.filter((v: any) => v.status === 'waiting'),
    completed: serviceVisits.filter((v: any) => v.status === 'completed'),
  };

  const stages = [
    { id: "inquired", label: "Inquired", count: servicesByStage.inquired.length },
    { id: "working", label: "Working", count: servicesByStage.working.length },
    { id: "waiting", label: "Waiting", count: servicesByStage.waiting.length },
    { id: "completed", label: "Completed", count: servicesByStage.completed.length },
  ];
  
  const totalVisits = serviceVisits.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Service Workflow</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load service visits</h3>
              <p className="text-muted-foreground mb-4">
                {(error as Error)?.message || 'An error occurred while fetching service visits'}
              </p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Service Workflow</h1>
        <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-service">
              <Plus className="h-4 w-4 mr-2" />
              New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Service Visit</DialogTitle>
              <DialogDescription>
                Create a new service visit for a customer vehicle
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select 
                  value={serviceForm.customerId} 
                  onValueChange={(value) => setServiceForm({ ...serviceForm, customerId: value })}
                  required
                >
                  <SelectTrigger id="customer" data-testid="select-customer">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer: any) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleReg">Vehicle Registration *</Label>
                <Input
                  id="vehicleReg"
                  value={serviceForm.vehicleReg}
                  onChange={(e) => setServiceForm({ ...serviceForm, vehicleReg: e.target.value })}
                  placeholder="Enter vehicle registration number"
                  required
                  data-testid="input-vehicle-reg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handler">Service Handler *</Label>
                <Select 
                  value={serviceForm.handlerId} 
                  onValueChange={(value) => setServiceForm({ ...serviceForm, handlerId: value })}
                  required
                >
                  <SelectTrigger id="handler" data-testid="select-handler">
                    <SelectValue placeholder="Select a service handler" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee: any) => (
                      <SelectItem key={employee._id} value={employee._id}>
                        {employee.name} - {employee.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={serviceForm.notes}
                  onChange={(e) => setServiceForm({ ...serviceForm, notes: e.target.value })}
                  placeholder="Add any additional notes"
                  rows={3}
                  data-testid="textarea-notes"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsServiceDialogOpen(false)}
                  data-testid="button-cancel-service"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createServiceMutation.isPending}
                  data-testid="button-submit-service"
                >
                  {createServiceMutation.isPending ? 'Creating...' : 'Create Service'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {stages.map((stage) => (
          <Badge
            key={stage.id}
            variant="outline"
            className="text-sm py-1.5 px-3"
            data-testid={`badge-${stage.id}`}
          >
            {stage.label} ({stage.count})
          </Badge>
        ))}
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {stages.map((stage) => (
            <Card key={stage.id} className="w-96 flex-shrink-0" data-testid={`card-stage-${stage.id}`}>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  {stage.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {servicesByStage[stage.id as keyof typeof servicesByStage].length > 0 ? (
                  servicesByStage[stage.id as keyof typeof servicesByStage].map((service: any) => (
                    <ServiceWorkflowCard
                      key={service._id}
                      customerName={service.customerId?.name || 'Unknown'}
                      vehicleReg={service.vehicleReg}
                      status={service.status}
                      handler={service.handlerId?.name || 'Unassigned'}
                      startTime={formatDistance(new Date(service.createdAt), new Date(), { addSuffix: true })}
                      totalAmount={service.totalAmount}
                      partsCount={service.partsUsed?.length || 0}
                      notes={service.notes}
                      onClick={() => handleServiceClick(service)}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8" data-testid={`empty-${stage.id}`}>
                    No services in {stage.label.toLowerCase()} stage
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {totalVisits === 0 && (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No service visits found. Create your first service visit to get started.</p>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Service Status</DialogTitle>
            <DialogDescription>
              Update the status of the service visit to move it through the pipeline
            </DialogDescription>
          </DialogHeader>
          
          {selectedService && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Customer</Label>
                <p className="text-sm text-muted-foreground" data-testid="text-edit-customer">
                  {selectedService.customerId?.name || 'Unknown'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Vehicle Registration</Label>
                <p className="text-sm text-muted-foreground" data-testid="text-edit-vehicle">
                  {selectedService.vehicleReg}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Status</Label>
                <p className="text-sm text-muted-foreground capitalize" data-testid="text-edit-current-status">
                  {selectedService.status}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newStatus">New Status *</Label>
                <Select 
                  key={selectedService._id}
                  defaultValue={selectedService.status}
                  onValueChange={handleStatusUpdate}
                  disabled={updateServiceMutation.isPending}
                >
                  <SelectTrigger id="newStatus" data-testid="select-new-status">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inquired">Inquired</SelectItem>
                    <SelectItem value="working">Working</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={updateServiceMutation.isPending}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
