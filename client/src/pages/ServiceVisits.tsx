import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ServiceWorkflowCard } from "@/components/ServiceWorkflowCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistance } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth, hasPermission } from "@/lib/auth";

export default function ServiceVisits() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [beforeImages, setBeforeImages] = useState<string[]>([]);
  const [afterImages, setAfterImages] = useState<string[]>([]);
  const [serviceForm, setServiceForm] = useState({
    customerId: "",
    vehicleReg: "",
    handlerId: "",
    notes: "",
  });

  const canDelete = hasPermission(user, 'orders', 'delete');

  const { data: serviceVisits = [], isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ["/api/service-visits"],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  const { data: employees = [] } = useQuery<any[]>({
    queryKey: ["/api/service-handlers"],
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
    mutationFn: async ({ id, status, beforeImages, afterImages }: { id: string; status: string; beforeImages?: string[]; afterImages?: string[] }) => {
      const response = await apiRequest('PATCH', `/api/service-visits/${id}`, { status, beforeImages, afterImages });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-visits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      setIsEditDialogOpen(false);
      setSelectedService(null);
      setSelectedStatus("");
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

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/service-visits/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-visits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      setIsEditDialogOpen(false);
      setSelectedService(null);
      setSelectedStatus("");
      toast({
        title: "Success",
        description: "Service visit deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service visit",
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
    setSelectedStatus(service.status);
    setBeforeImages(service.beforeImages || []);
    setAfterImages(service.afterImages || []);
    setIsEditDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedService || !selectedStatus) return;
    
    if (selectedStatus === selectedService.status && 
        JSON.stringify(beforeImages) === JSON.stringify(selectedService.beforeImages || []) &&
        JSON.stringify(afterImages) === JSON.stringify(selectedService.afterImages || [])) {
      toast({
        title: "No Changes",
        description: "No changes detected",
        variant: "default",
      });
      return;
    }
    
    updateServiceMutation.mutate({
      id: selectedService._id,
      status: selectedStatus,
      beforeImages,
      afterImages,
    });
  };

  const handleBeforeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBeforeImages([...beforeImages, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAfterImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterImages([...afterImages, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteService = () => {
    if (selectedService) {
      deleteServiceMutation.mutate(selectedService._id);
      setIsDeleteDialogOpen(false);
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
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  disabled={updateServiceMutation.isPending || deleteServiceMutation.isPending}
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

              <div className="space-y-2">
                <Label>Before Service Images</Label>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={handleBeforeImageUpload}
                  data-testid="input-before-image"
                />
                {beforeImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {beforeImages.map((img, idx) => (
                      <div key={idx} className="relative border-2 border-orange-300 dark:border-orange-700 rounded p-1">
                        <img src={img} alt={`Before ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => setBeforeImages(beforeImages.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          data-testid={`button-remove-before-${idx}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>After Service Images</Label>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAfterImageUpload}
                  data-testid="input-after-image"
                />
                {afterImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {afterImages.map((img, idx) => (
                      <div key={idx} className="relative border-2 border-orange-300 dark:border-orange-700 rounded p-1">
                        <img src={img} alt={`After ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => setAfterImages(afterImages.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          data-testid={`button-remove-after-${idx}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={`flex ${canDelete ? 'justify-between' : 'justify-end'} gap-2 pt-4`}>
                {canDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={updateServiceMutation.isPending || deleteServiceMutation.isPending}
                    data-testid="button-delete-service"
                  >
                    Delete Service
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={updateServiceMutation.isPending || deleteServiceMutation.isPending}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={updateServiceMutation.isPending || deleteServiceMutation.isPending || !selectedStatus}
                    data-testid="button-update-status"
                  >
                    {updateServiceMutation.isPending ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Visit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service visit? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteService}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteServiceMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
