import {
  LayoutDashboard,
  Package,
  Warehouse,
  Users,
  UserCircle,
  ClipboardList,
  ShoppingCart,
  BarChart3,
  Settings,
  Calendar,
  LockKeyhole,
  User,
  LogOut,
  Shield,
  Building2,
  FileText,
  CheckSquare,
  CalendarOff,
  MessageSquare,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: { resource: string; action: string };
  disabled?: boolean;
}

const mainMenuItems: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Products", url: "/products", icon: Package, permission: { resource: "products", action: "read" } },
  { title: "Inventory", url: "/inventory", icon: Warehouse, permission: { resource: "inventory", action: "read" } },
  { title: "Customers", url: "/customers", icon: Users, permission: { resource: "customers", action: "read" } },
  { title: "Service Visits", url: "/visits", icon: ClipboardList, permission: { resource: "orders", action: "read" } },
  { title: "Orders", url: "/orders", icon: ShoppingCart, permission: { resource: "orders", action: "read" } },
  { title: "Suppliers", url: "/suppliers", icon: Building2, permission: { resource: "suppliers", action: "read" } },
  { title: "Purchase Orders", url: "/purchase-orders", icon: FileText, permission: { resource: "purchaseOrders", action: "read" } },
];

const managementItems: MenuItem[] = [
  { title: "Employees", url: "/employees", icon: UserCircle, permission: { resource: "employees", action: "read" } },
  { title: "Attendance", url: "/attendance", icon: Calendar, permission: { resource: "attendance", action: "read" } },
  { title: "Tasks", url: "/tasks", icon: CheckSquare, permission: { resource: "tasks", action: "read" } },
  { title: "Leaves", url: "/leaves", icon: CalendarOff, permission: { resource: "leaves", action: "read" } },
  { title: "Communications", url: "/communications", icon: MessageSquare, permission: { resource: "communications", action: "read" } },
  { title: "Reports", url: "/reports", icon: BarChart3, permission: { resource: "reports", action: "read" } },
  { title: "User Management", url: "/users", icon: Shield, permission: { resource: "users", action: "read" } },
];

const systemItems: MenuItem[] = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Helper function to check if user has permission
  const hasPermission = (item: MenuItem) => {
    if (!item.permission) return true; // No permission required
    const { resource, action } = item.permission;
    return user?.permissions?.[resource]?.includes(action) || false;
  };

  // Filter menu items based on permissions
  const visibleMainMenuItems = mainMenuItems.filter(hasPermission);
  const visibleManagementItems = managementItems.filter(hasPermission);
  const visibleSystemItems = systemItems.filter(hasPermission);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AutoShop</h2>
            <p className="text-xs text-muted-foreground">Manager v1.0</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {visibleMainMenuItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleMainMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url}
                      data-testid={`link-${item.title.toLowerCase().replace(" ", "-")}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleManagementItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild={!item.disabled}
                      isActive={location === item.url}
                      disabled={item.disabled}
                      data-testid={`link-${item.title.toLowerCase().replace(" ", "-")}`}
                    >
                      {item.disabled ? (
                        <div className="flex items-center gap-2 opacity-50">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <Badge variant="secondary" className="ml-auto text-xs">
                            Soon
                          </Badge>
                        </div>
                      ) : (
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleSystemItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleSystemItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url}
                      data-testid={`link-${item.title.toLowerCase()}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto" data-testid="button-user-menu">
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.role || 'Role'}</p>
                </div>
                <LockKeyhole className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive" data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
