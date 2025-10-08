import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Package, IndianRupee, FileText } from "lucide-react";

interface ServiceWorkflowCardProps {
  customerName: string;
  vehicleReg: string;
  status: "inquired" | "working" | "waiting" | "completed";
  handler: string;
  startTime: string;
  totalAmount?: number;
  partsCount?: number;
  notes?: string;
  onClick?: () => void;
}

export function ServiceWorkflowCard({
  customerName,
  vehicleReg,
  status,
  handler,
  startTime,
  totalAmount,
  partsCount,
  notes,
  onClick,
}: ServiceWorkflowCardProps) {
  const initials = handler
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="hover-elevate cursor-pointer" onClick={onClick} data-testid={`service-card-${vehicleReg}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold">{customerName}</CardTitle>
            <p className="text-sm text-muted-foreground font-mono mt-2">{vehicleReg}</p>
          </div>
          <StatusBadge type="service" status={status} />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{handler}</p>
            <p className="text-xs text-muted-foreground">Handler</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{startTime}</p>
            </div>
          </div>
          
          {partsCount !== undefined && partsCount > 0 && (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{partsCount} parts</p>
              </div>
            </div>
          )}
        </div>

        {totalAmount !== undefined && totalAmount > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <IndianRupee className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        )}

        {notes && (
          <div className="flex items-start gap-2 pt-2 border-t">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
