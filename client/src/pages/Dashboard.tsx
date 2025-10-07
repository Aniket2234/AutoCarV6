import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { KPICard } from "@/components/KPICard";
import { ServiceWorkflowCard } from "@/components/ServiceWorkflowCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle, 
  Plus, 
  TrendingUp,
  ClipboardCheck,
  UserCheck,
  FileText,
  CheckCircle,
  ShoppingCart
} from "lucide-react";
import { formatDistance } from "date-fns";

interface DashboardStats {
  // Admin stats
  todaySales?: number;
  activeServices?: number;
  totalCustomers?: number;
  lowStockProducts?: any[];
  totalEmployees?: number;
  totalProducts?: number;
  
  // Inventory Manager stats
  totalInventoryValue?: number;
  recentTransactions?: number;
  
  // Sales Executive stats
  activeOrders?: number;
  totalOrders?: number;
  
  // HR Manager stats
  presentToday?: number;
  pendingLeaves?: number;
  activeTasks?: number;
  
  // Service Staff stats
  myActiveOrders?: number;
  myCompletedToday?: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: dashboardStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard-stats"],
  });

  const { data: serviceVisits, isLoading: visitsLoading, error: visitsError, refetch: refetchVisits } = useQuery<any[]>({
    queryKey: ["/api/service-visits"],
    enabled: user?.role === 'Admin' || user?.role === 'Service Staff',
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

  // Role-based KPI configuration
  const getRoleKPIs = () => {
    if (!user || !dashboardStats) return [];

    switch (user.role) {
      case 'Admin':
        return [
          {
            title: "Today's Sales",
            value: formatCurrency(dashboardStats.todaySales || 0),
            icon: DollarSign,
            trend: { value: 12.5, isPositive: true },
          },
          {
            title: "Active Service Jobs",
            value: dashboardStats.activeServices || 0,
            icon: Package,
          },
          {
            title: "Low Stock Items",
            value: dashboardStats.lowStockProducts?.length || 0,
            icon: AlertTriangle,
          },
          {
            title: "Total Customers",
            value: dashboardStats.totalCustomers || 0,
            icon: Users,
          },
        ];
      
      case 'Inventory Manager':
        return [
          {
            title: "Total Products",
            value: dashboardStats.totalProducts || 0,
            icon: Package,
          },
          {
            title: "Inventory Value",
            value: formatCurrency(dashboardStats.totalInventoryValue || 0),
            icon: DollarSign,
          },
          {
            title: "Low Stock Items",
            value: dashboardStats.lowStockProducts?.length || 0,
            icon: AlertTriangle,
          },
          {
            title: "Today's Transactions",
            value: dashboardStats.recentTransactions || 0,
            icon: TrendingUp,
          },
        ];
      
      case 'Sales Executive':
        return [
          {
            title: "Today's Sales",
            value: formatCurrency(dashboardStats.todaySales || 0),
            icon: DollarSign,
            trend: { value: 12.5, isPositive: true },
          },
          {
            title: "Total Customers",
            value: dashboardStats.totalCustomers || 0,
            icon: Users,
          },
          {
            title: "Active Orders",
            value: dashboardStats.activeOrders || 0,
            icon: ShoppingCart,
          },
          {
            title: "Total Orders",
            value: dashboardStats.totalOrders || 0,
            icon: ClipboardCheck,
          },
        ];
      
      case 'HR Manager':
        return [
          {
            title: "Total Employees",
            value: dashboardStats.totalEmployees || 0,
            icon: Users,
          },
          {
            title: "Present Today",
            value: dashboardStats.presentToday || 0,
            icon: UserCheck,
          },
          {
            title: "Pending Leaves",
            value: dashboardStats.pendingLeaves || 0,
            icon: FileText,
          },
          {
            title: "Active Tasks",
            value: dashboardStats.activeTasks || 0,
            icon: ClipboardCheck,
          },
        ];
      
      case 'Service Staff':
        return [
          {
            title: "My Active Orders",
            value: dashboardStats.myActiveOrders || 0,
            icon: Package,
          },
          {
            title: "Completed Today",
            value: dashboardStats.myCompletedToday || 0,
            icon: CheckCircle,
          },
          {
            title: "Total Customers",
            value: dashboardStats.totalCustomers || 0,
            icon: Users,
          },
        ];
      
      default:
        return [];
    }
  };

  const kpiData = getRoleKPIs();
  const showStatsLoading = statsLoading;
  const showVisitsLoading = visitsLoading && !statsLoading;

  // Role-based welcome message
  const getWelcomeMessage = () => {
    if (!user) return "Welcome back";
    
    switch (user.role) {
      case 'Admin':
        return `Welcome back, ${user.name}`;
      case 'Inventory Manager':
        return `Inventory Overview - ${user.name}`;
      case 'Sales Executive':
        return `Sales Dashboard - ${user.name}`;
      case 'HR Manager':
        return `HR Dashboard - ${user.name}`;
      case 'Service Staff':
        return `My Services - ${user.name}`;
      default:
        return `Welcome back, ${user.name}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1" data-testid="text-welcome">{getWelcomeMessage()}</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Service Staff') && (
          <Button data-testid="button-new-service">
            <Plus className="h-4 w-4 mr-2" />
            New Service
          </Button>
        )}
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
        {/* Active Service Jobs - Admin and Service Staff only */}
        {(user?.role === 'Admin' || user?.role === 'Service Staff') && (
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
        )}

        {/* Low Stock Alerts - Admin and Inventory Manager only */}
        {(user?.role === 'Admin' || user?.role === 'Inventory Manager') && (
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
        )}
      </div>
    </div>
  );
}
