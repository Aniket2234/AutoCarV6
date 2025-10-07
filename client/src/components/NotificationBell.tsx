import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  message: string;
  type: "low_stock" | "new_order" | "payment_due" | "info";
  read: boolean;
  timestamp: string;
}

export function NotificationBell() {
  // todo: remove mock functionality
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      message: "Low stock alert: Brake Pads Set (12 units remaining)",
      type: "low_stock",
      read: false,
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      message: "New order received from John Smith - Order #ORD-2024-001",
      type: "new_order",
      read: false,
      timestamp: "3 hours ago",
    },
    {
      id: "3",
      message: "Payment overdue: Invoice #INV-2024-045 (5 days)",
      type: "payment_due",
      read: true,
      timestamp: "1 day ago",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "low_stock":
        return "bg-warning/10 text-warning";
      case "new_order":
        return "bg-info/10 text-info";
      case "payment_due":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-xs text-muted-foreground mt-1">{unreadCount} unread messages</p>
        </div>
        <ScrollArea className="h-[320px]">
          <div className="p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 rounded-md mb-2 hover-elevate",
                  !notification.read && "bg-primary/5"
                )}
                data-testid={`notification-${notification.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("h-2 w-2 rounded-full mt-1.5", getTypeColor(notification.type))} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full" size="sm" data-testid="button-mark-all-read">
            Mark all as read
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
