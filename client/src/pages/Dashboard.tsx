import { KPICard } from "@/components/KPICard";
import { ServiceWorkflowCard } from "@/components/ServiceWorkflowCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Package, Users, AlertTriangle, Plus } from "lucide-react";

export default function Dashboard() {
  // todo: remove mock functionality
  const kpiData = [
    {
      title: "Today's Sales",
      value: "$12,450",
      icon: DollarSign,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: "Active Service Jobs",
      value: 8,
      icon: Package,
      trend: { value: 3, isPositive: false },
    },
    {
      title: "Low Stock Items",
      value: 5,
      icon: AlertTriangle,
    },
    {
      title: "New Customers",
      value: 12,
      icon: Users,
      trend: { value: 8.2, isPositive: true },
    },
  ];

  const activeServices = [
    {
      customerName: "John Smith",
      vehicleReg: "ABC-1234",
      status: "working" as const,
      handler: "Mike Johnson",
      startTime: "2h ago",
    },
    {
      customerName: "Sarah Williams",
      vehicleReg: "XYZ-5678",
      status: "waiting" as const,
      handler: "David Lee",
      startTime: "4h ago",
    },
    {
      customerName: "Robert Brown",
      vehicleReg: "DEF-9012",
      status: "inquired" as const,
      handler: "Emily Chen",
      startTime: "30m ago",
    },
  ];

  const lowStockItems = [
    { name: "Brake Pads Set", stock: 12, reorderLevel: 20 },
    { name: "Engine Oil 5W-30", stock: 8, reorderLevel: 15 },
    { name: "Air Filter", stock: 5, reorderLevel: 10 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Admin User</p>
        </div>
        <Button data-testid="button-new-service">
          <Plus className="h-4 w-4 mr-2" />
          New Service
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Service Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeServices.map((service, index) => (
              <ServiceWorkflowCard
                key={index}
                {...service}
                onClick={() => console.log("Service clicked:", service)}
              />
            ))}
            <Button variant="outline" className="w-full" data-testid="button-view-all-services">
              View All Services
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover-elevate"
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Reorder level: {item.reorderLevel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-warning">{item.stock}</p>
                    <p className="text-xs text-muted-foreground">in stock</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" data-testid="button-view-inventory">
                View Full Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
