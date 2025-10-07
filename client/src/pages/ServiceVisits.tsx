import { useQuery } from "@tanstack/react-query";
import { ServiceWorkflowCard } from "@/components/ServiceWorkflowCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistance } from "date-fns";

export default function ServiceVisits() {
  const { data: serviceVisits = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/service-visits"],
  });

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
        <Button data-testid="button-new-service">
          <Plus className="h-4 w-4 mr-2" />
          New Service
        </Button>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage) => (
          <Card key={stage.id} data-testid={`card-stage-${stage.id}`}>
            <CardHeader>
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
                    onClick={() => console.log("Service clicked:", service)}
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
      
      {totalVisits === 0 && (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No service visits found. Create your first service visit to get started.</p>
        </div>
      )}
    </div>
  );
}
