import { ServiceWorkflowCard } from "@/components/ServiceWorkflowCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function ServiceVisits() {
  // todo: remove mock functionality
  const servicesByStage = {
    inquired: [
      {
        customerName: "Ankit Verma",
        vehicleReg: "KA-03-MN-9012",
        status: "inquired" as const,
        handler: "Sneha Reddy",
        startTime: "30m ago",
      },
      {
        customerName: "Meera Iyer",
        vehicleReg: "TN-09-GH-3456",
        status: "inquired" as const,
        handler: "Amit Sharma",
        startTime: "45m ago",
      },
    ],
    working: [
      {
        customerName: "Rajesh Kumar",
        vehicleReg: "MH-12-AB-1234",
        status: "working" as const,
        handler: "Amit Sharma",
        startTime: "2h ago",
      },
      {
        customerName: "Suresh Menon",
        vehicleReg: "KL-07-JK-7890",
        status: "working" as const,
        handler: "Priya Patel",
        startTime: "3h ago",
      },
    ],
    waiting: [
      {
        customerName: "Priya Patel",
        vehicleReg: "DL-8C-XY-5678",
        status: "waiting" as const,
        handler: "Vikram Singh",
        startTime: "4h ago",
      },
    ],
    completed: [
      {
        customerName: "Arjun Nair",
        vehicleReg: "MH-14-MN-2345",
        status: "completed" as const,
        handler: "Sneha Reddy",
        startTime: "1h ago",
      },
      {
        customerName: "Lakshmi Krishnan",
        vehicleReg: "TN-22-PQ-6789",
        status: "completed" as const,
        handler: "Vikram Singh",
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
