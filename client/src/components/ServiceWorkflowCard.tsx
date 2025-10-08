import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

interface ServiceWorkflowCardProps {
  customerName: string;
  vehicleReg: string;
  status: "inquired" | "working" | "waiting" | "completed";
  handler: string;
  startTime: string;
  onClick?: () => void;
}

export function ServiceWorkflowCard({
  customerName,
  vehicleReg,
  status,
  handler,
  startTime,
  onClick,
}: ServiceWorkflowCardProps) {
  const initials = handler
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="hover-elevate cursor-pointer" onClick={onClick} data-testid={`service-card-${vehicleReg}`}>
      <CardHeader className="pb-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-semibold leading-tight">{customerName}</CardTitle>
            <p className="text-xs text-muted-foreground font-mono mt-1.5">{vehicleReg}</p>
          </div>
          <StatusBadge type="service" status={status} />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate flex-1">{handler}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{startTime}</span>
        </div>
      </CardContent>
    </Card>
  );
}
