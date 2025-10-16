import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ServiceWorkflowCard } from "@/components/ServiceWorkflowCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Wrench, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistance } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth, hasPermission } from "@/lib/auth";

export default function ServiceVisits() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [beforeImages, setBeforeImages] = useState<string[]>([]);
  const [afterImages, setAfterImages] = useState<string[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<string>("");
  const [serviceForm, setServiceForm] = useState({
    customerId: "",
    vehicleReg: "",
    handlerIds: [] as string[],
    notes: "",
    status: "inquired",
  });

  const canDelete = hasPermission(user, 'orders', 'delete');

  const { data: serviceVisits = [], isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ["/api/service-visits"],
  });

  const { data: customers = [], isLoading: isLoadingCustomers, error: customersError } = useQuery<any[]>({
    queryKey: ["/api/registration/customers"],
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
      setServiceForm({ customerId: "", vehicleReg: "", handlerIds: [] as string[], notes: "", status: "inquired" });
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
    mutationFn: async ({ id, status, beforeImages, afterImages, invoiceNumber, invoiceDate }: { id: string; status: string; beforeImages?: string[]; afterImages?: string[]; invoiceNumber?: string; invoiceDate?: string }) => {
      const response = await apiRequest('PATCH', `/api/service-visits/${id}`, { status, beforeImages, afterImages, invoiceNumber, invoiceDate });
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
    
    if (!serviceForm.customerId || !serviceForm.vehicleReg || serviceForm.handlerIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select at least one service handler",
        variant: "destructive",
      });
      return;
    }
    
    createServiceMutation.mutate(serviceForm);
  };

  const handleViewService = (service: any) => {
    setSelectedService(service);
    setIsViewDialogOpen(true);
  };

  const handleEditService = (service: any) => {
    setSelectedService(service);
    setSelectedStatus(service.status);
    setBeforeImages(service.beforeImages || []);
    setAfterImages(service.afterImages || []);
    setInvoiceNumber(service.invoiceNumber || "");
    setInvoiceDate(service.invoiceDate ? new Date(service.invoiceDate).toISOString().split('T')[0] : "");
    setIsEditDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedService || !selectedStatus) return;
    
    // Validate invoice fields when status is completed
    if (selectedStatus === 'completed' && !invoiceNumber) {
      toast({
        title: "Validation Error",
        description: "Invoice number is required for completed services",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedStatus === selectedService.status && 
        JSON.stringify(beforeImages) === JSON.stringify(selectedService.beforeImages || []) &&
        JSON.stringify(afterImages) === JSON.stringify(selectedService.afterImages || []) &&
        invoiceNumber === (selectedService.invoiceNumber || "") &&
        invoiceDate === (selectedService.invoiceDate ? new Date(selectedService.invoiceDate).toISOString().split('T')[0] : "")) {
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
      invoiceNumber: selectedStatus === 'completed' ? invoiceNumber : undefined,
      invoiceDate: selectedStatus === 'completed' && invoiceDate ? invoiceDate : undefined,
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
                  disabled={isLoadingCustomers}
                >
                  <SelectTrigger id="customer" data-testid="select-customer">
                    <SelectValue placeholder={
                      isLoadingCustomers 
                        ? "Loading customers..." 
                        : customersError 
                        ? "Error loading customers" 
                        : customers.length === 0 
                        ? "No customers available" 
                        : "Select a customer"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.fullName} - {customer.mobileNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {customersError && (
                  <p className="text-sm text-destructive">Failed to load customers. Please try again.</p>
                )}
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
                <Label>Service Handlers * (Select one or more)</Label>
                <div className="border rounded-md p-4 space-y-3 max-h-48 overflow-y-auto">
                  {employees.length > 0 ? (
                    employees.map((employee: any) => (
                      <div key={employee._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`handler-${employee._id}`}
                          checked={serviceForm.handlerIds.includes(employee._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setServiceForm({ 
                                ...serviceForm, 
                                handlerIds: [...serviceForm.handlerIds, employee._id] 
                              });
                            } else {
                              setServiceForm({ 
                                ...serviceForm, 
                                handlerIds: serviceForm.handlerIds.filter(id => id !== employee._id) 
                              });
                            }
                          }}
                          data-testid={`checkbox-handler-${employee._id}`}
                        />
                        <label
                          htmlFor={`handler-${employee._id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {employee.name} - {employee.role}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No service handlers available</p>
                  )}
                </div>
                {serviceForm.handlerIds.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {serviceForm.handlerIds.length} handler{serviceForm.handlerIds.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Service Status *</Label>
                <Select 
                  value={serviceForm.status} 
                  onValueChange={(value) => setServiceForm({ ...serviceForm, status: value })}
                  required
                >
                  <SelectTrigger id="status" data-testid="select-status">
                    <SelectValue placeholder="Select initial status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="inquired" value="inquired">Inquired</SelectItem>
                    <SelectItem key="working" value="working">Working</SelectItem>
                    <SelectItem key="waiting" value="waiting">Waiting</SelectItem>
                    <SelectItem key="completed" value="completed">Completed</SelectItem>
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
                      handlers={service.handlerIds?.map((h: any) => h.name) || []}
                      startTime={formatDistance(new Date(service.createdAt), new Date(), { addSuffix: true })}
                      totalAmount={service.totalAmount}
                      partsCount={service.partsUsed?.length || 0}
                      notes={service.notes}
                      onView={() => handleViewService(service)}
                      onEdit={() => handleEditService(service)}
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

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
            <DialogDescription>
              Complete information about this service visit
            </DialogDescription>
          </DialogHeader>
          
          {selectedService && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <p className="text-sm font-medium" data-testid="view-customer">
                    {selectedService.customerId?.name || 'Unknown'}
                  </p>
                  {selectedService.customerId?.mobileNumber && (
                    <p className="text-xs text-muted-foreground">
                      {selectedService.customerId.mobileNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Vehicle Registration</Label>
                  <p className="text-sm font-medium font-mono" data-testid="view-vehicle">
                    {selectedService.vehicleReg}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge variant="outline" className="capitalize" data-testid="view-status">
                    {selectedService.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Service Handlers</Label>
                  {selectedService.handlerIds && selectedService.handlerIds.length > 0 ? (
                    <div className="space-y-2">
                      {selectedService.handlerIds.map((handler: any) => (
                        <div key={handler._id} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {handler.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{handler.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{handler.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No handlers assigned</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Service Timeline</Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Started:</span>
                      <span className="font-medium">{formatDistance(new Date(selectedService.createdAt), new Date(), { addSuffix: true })}</span>
                    </div>
                    {selectedService.totalAmount !== undefined && selectedService.totalAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(selectedService.totalAmount)}
                        </span>
                      </div>
                    )}
                    {selectedService.partsUsed && selectedService.partsUsed.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parts Used:</span>
                        <span className="font-medium">{selectedService.partsUsed.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedService.status === 'completed' && (selectedService.invoiceNumber || selectedService.invoiceDate) && (
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <Label className="text-sm font-medium text-green-900 dark:text-green-100">Invoice Details</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {selectedService.invoiceNumber && (
                      <div>
                        <Label className="text-xs text-green-700 dark:text-green-300">Invoice Number</Label>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">{selectedService.invoiceNumber}</p>
                      </div>
                    )}
                    {selectedService.invoiceDate && (
                      <div>
                        <Label className="text-xs text-green-700 dark:text-green-300">Invoice Date</Label>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          {new Date(selectedService.invoiceDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedService.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg whitespace-pre-wrap">
                    {selectedService.notes}
                  </p>
                </div>
              )}

              {(selectedService.beforeImages?.length > 0 || selectedService.afterImages?.length > 0) && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Before Service Images</Label>
                    {selectedService.beforeImages && selectedService.beforeImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedService.beforeImages.map((img: string, idx: number) => (
                          <div key={idx} className="relative border-2 border-orange-300 dark:border-orange-700 rounded overflow-hidden">
                            <img src={img} alt={`Before ${idx + 1}`} className="w-full h-32 object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No images uploaded</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">After Service Images</Label>
                    {selectedService.afterImages && selectedService.afterImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedService.afterImages.map((img: string, idx: number) => (
                          <div key={idx} className="relative border-2 border-green-300 dark:border-green-700 rounded overflow-hidden">
                            <img src={img} alt={`After ${idx + 1}`} className="w-full h-32 object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No images uploaded</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                  data-testid="button-close-view"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEditService(selectedService);
                  }}
                  data-testid="button-edit-from-view"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Service
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Service Status</DialogTitle>
            <DialogDescription>
              Update the status of the service visit to move it through the pipeline
            </DialogDescription>
          </DialogHeader>
          
          {selectedService && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
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
              </div>

              <div className="grid grid-cols-1 gap-4">
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
                      <SelectItem key="inquired" value="inquired">Inquired</SelectItem>
                      <SelectItem key="working" value="working">Working</SelectItem>
                      <SelectItem key="waiting" value="waiting">Waiting</SelectItem>
                      <SelectItem key="completed" value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedStatus === 'completed' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="INV-2024-001"
                      required
                      data-testid="input-invoice-number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      data-testid="input-invoice-date"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
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
                          <img src={img} alt={`Before ${idx + 1}`} className="w-full h-24 object-cover rounded" />
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
                          <img src={img} alt={`After ${idx + 1}`} className="w-full h-24 object-cover rounded" />
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
