import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Inventory from "@/pages/Inventory";
import Customers from "@/pages/Customers";
import ServiceVisits from "@/pages/ServiceVisits";
import Orders from "@/pages/Orders";
import Employees from "@/pages/Employees";
import Attendance from "@/pages/Attendance";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/products" component={Products} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/customers" component={Customers} />
      <Route path="/visits" component={ServiceVisits} />
      <Route path="/orders" component={Orders} />
      <Route path="/employees" component={Employees} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between gap-4 px-6 py-3 border-b border-border bg-background">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-2">
                    <NotificationBell />
                    <ThemeToggle />
                  </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
