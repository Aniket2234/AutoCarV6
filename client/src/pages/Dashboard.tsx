import { useQuery } from "@tanstack/react-query";
import { KPICard } from "@/components/KPICard";
import { ServiceWorkflowCard } from "@/components/ServiceWorkflowCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Package, Users, AlertTriangle, Plus } from "lucide-react";
import { formatDistance } from "date-fns";

export default function Dashboard() {
  const { data: dashboardStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ["/api/dashboard-stats"],
  });

  const { data: serviceVisits, isLoading: visitsLoading, error: visitsError, refetch: refetchVisits } = useQuery({
    queryKey: ["/api/service-visits"],
  });

  const activeServices = serviceVisits?.filter((visit: any) => 
    ['inquired', 'working', 'waiting'].includes(visit.status)
  ).slice(0, 3) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const kpiData = [
    {
      title: "Today's Sales",
      value: dashboardStats ? formatCurrency(dashboardStats.todaySales) : "₹0",
      icon: DollarSign,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: "Active Service Jobs",
      value: dashboardStats?.activeServices || 0,
      icon: Package,
      trend: { value: 3, isPositive: false },
    },
    {
      title: "Low Stock Items",
      value: dashboardStats?.lowStockProducts?.length || 0,
      icon: AlertTriangle,
    },
    {
      title: "Total Customers",
      value: dashboardStats?.totalCustomers || 0,
      icon: Users,
      trend: { value: 8.2, isPositive: true },
    },
  ];

  const showStatsLoading = statsLoading;
  const showVisitsLoading = visitsLoading && !statsLoading;

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

      {statsError && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <p className="text-sm">Failed to load dashboard statistics</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchStats()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showStatsLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !statsError && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi) => (
            <KPICard key={kpi.title} {...kpi} />
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Service Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {visitsError ? (
              <div className="text-center py-4">
                <AlertTriangle className="h-8 w-8 mx-auto text-destructive mb-2" />
                <p className="text-sm text-muted-foreground mb-3">Failed to load service visits</p>
                <Button variant="outline" size="sm" onClick={() => refetchVisits()}>Retry</Button>
              </div>
            ) : showVisitsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : (
              <>
                {activeServices.map((service: any) => (
                  <ServiceWorkflowCard
                    key={service._id}
                    customerName={service.customerId?.name || 'Unknown'}
                    vehicleReg={service.vehicleReg}
                    status={service.status}
                    handler={service.handlerId?.name || 'Unassigned'}
                    startTime={formatDistance(new Date(service.createdAt), new Date(), { addSuffix: true })}
                    onClick={() => console.log("Service clicked:", service)}
                  />
                ))}
                {activeServices.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No active service jobs</p>
                )}
                <Button variant="outline" className="w-full" data-testid="button-view-all-services">
                  View All Services
                </Button>
              </>
            )}
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
            {statsError ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Stock data unavailable</p>
              </div>
            ) : showStatsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardStats?.lowStockProducts?.map((item: any) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover-elevate"
                    data-testid={`low-stock-${item._id}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Reorder level: {item.minStockLevel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-warning">{item.stockQty}</p>
                      <p className="text-xs text-muted-foreground">in stock</p>
                    </div>
                  </div>
                ))}
                {(!dashboardStats?.lowStockProducts || dashboardStats.lowStockProducts.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">No low stock items</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
