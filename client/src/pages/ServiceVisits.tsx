import { ServiceWorkflowCard } from "@/components/ServiceWorkflowCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function ServiceVisits() {
  // todo: remove mock functionality
  const servicesByStage = {
    inquired: [
      {
        customerName: "Robert Brown",
        vehicleReg: "DEF-9012",
        status: "inquired" as const,
        handler: "Emily Chen",
        startTime: "30m ago",
      },
      {
        customerName: "Lisa Anderson",
        vehicleReg: "GHI-3456",
        status: "inquired" as const,
        handler: "Mike Johnson",
        startTime: "45m ago",
      },
    ],
    working: [
      {
        customerName: "John Smith",
        vehicleReg: "ABC-1234",
        status: "working" as const,
        handler: "Mike Johnson",
        startTime: "2h ago",
      },
      {
        customerName: "Michael Davis",
        vehicleReg: "JKL-7890",
        status: "working" as const,
        handler: "Sarah Williams",
        startTime: "3h ago",
      },
    ],
    waiting: [
      {
        customerName: "Sarah Williams",
        vehicleReg: "XYZ-5678",
        status: "waiting" as const,
        handler: "David Lee",
        startTime: "4h ago",
      },
    ],
    completed: [
      {
        customerName: "James Wilson",
        vehicleReg: "MNO-2345",
        status: "completed" as const,
        handler: "Emily Chen",
        startTime: "1h ago",
      },
      {
        customerName: "Patricia Martinez",
        vehicleReg: "PQR-6789",
        status: "completed" as const,
        handler: "David Lee",
        startTime: "2h ago",
      },
    ],
  };

  const stages = [
    { id: "inquired", label: "Inquired", count: servicesByStage.inquired.length },
    { id: "working", label: "Working", count: servicesByStage.working.length },
    { id: "waiting", label: "Waiting for Parts", count: servicesByStage.waiting.length },
    { id: "completed", label: "Completed", count: servicesByStage.completed.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Workflow</h1>
          <p className="text-muted-foreground mt-1">Track customer service visits by stage</p>
        </div>
        <Button data-testid="button-new-visit">
          <Plus className="h-4 w-4 mr-2" />
          New Visit
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage) => (
          <Card key={stage.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                {stage.label}
                <span className="text-2xl font-bold text-muted-foreground">{stage.count}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {servicesByStage[stage.id as keyof typeof servicesByStage].map((service, index) => (
                <ServiceWorkflowCard
                  key={index}
                  {...service}
                  onClick={() => console.log("Service clicked:", service)}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
