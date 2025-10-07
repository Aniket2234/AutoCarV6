import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Car, Phone, Mail, User, Calendar, QrCode, Printer } from "lucide-react";

interface Visit {
  date: string;
  handler: string;
  status: string;
  parts: string[];
}

interface DigitalCustomerCardProps {
  customer: {
    name: string;
    phone: string;
    email: string;
    vehicle: {
      regNo: string;
      make: string;
      model: string;
      year: number;
    };
  };
  totalVisits: number;
  lastHandler: string;
  currentHandler?: string;
  recentVisits: Visit[];
}

export function DigitalCustomerCard({
  customer,
  totalVisits,
  lastHandler,
  currentHandler,
  recentVisits,
}: DigitalCustomerCardProps) {
  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-xl">{customer.name}</CardTitle>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {customer.email}
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" data-testid="button-print-card">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <Car className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">
              {customer.vehicle.make} {customer.vehicle.model}
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              {customer.vehicle.regNo} • {customer.vehicle.year}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Visits</p>
            <p className="text-2xl font-bold">{totalVisits}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Last Handler</p>
            <p className="text-sm font-medium">{lastHandler}</p>
          </div>
          {currentHandler && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Handler</p>
              <p className="text-sm font-medium">{currentHandler}</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="font-semibold">Service History</h4>
          <div className="space-y-3">
            {recentVisits.map((visit, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium">{visit.date}</p>
                    <Badge variant="outline">{visit.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Handler: {visit.handler}
                  </p>
                  {visit.parts.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Parts: {visit.parts.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center p-4 bg-white dark:bg-card rounded-lg border border-border">
          <div className="text-center">
            <QrCode className="h-24 w-24 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">QR Code (Coming Soon)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
