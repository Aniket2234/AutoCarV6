import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Car, Phone, Mail, User, Calendar, QrCode, Printer, Star, Gift, TrendingUp } from "lucide-react";
import carImage from "@assets/image_1760164042662.png";

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
      photo?: string;
    };
    loyaltyTier?: string;
    discountPercentage?: number;
    loyaltyPoints?: number;
    totalSpent?: number;
  };
  totalVisits: number;
  lastHandler: string;
  currentHandler?: string;
  recentVisits: Visit[];
  hidePhone?: boolean;
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'Platinum':
      return 'bg-gradient-to-r from-slate-400 to-slate-600 text-white';
    case 'Gold':
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    case 'Silver':
      return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    case 'Bronze':
      return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    default:
      return 'bg-muted';
  }
};

export function DigitalCustomerCard({
  customer,
  totalVisits,
  lastHandler,
  currentHandler,
  recentVisits,
  hidePhone = false,
}: DigitalCustomerCardProps) {
  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const loyaltyTier = customer.loyaltyTier || 'Bronze';
  const discountPercentage = customer.discountPercentage || 0;
  const loyaltyPoints = customer.loyaltyPoints || 0;
  const totalSpent = customer.totalSpent || 0;

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 4) return "••••••";
    return "••••••" + phone.slice(-4);
  };

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
                  {hidePhone ? maskPhone(customer.phone) : customer.phone}
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

        <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex-shrink-0">
            {customer.vehicle.photo ? (
              <img src={customer.vehicle.photo} alt="Vehicle" className="h-16 w-16 object-cover rounded-md border-2 border-orange-300 dark:border-orange-700" />
            ) : (
              <img src={carImage} alt="Car" className="h-16 w-16 object-contain" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg text-orange-900 dark:text-orange-100">
              {customer.vehicle.make} {customer.vehicle.model}
            </p>
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 font-mono">
              {customer.vehicle.regNo} • {customer.vehicle.year}
            </p>
          </div>
          <Car className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>

        {/* Loyalty Card Section */}
        <div className={`p-4 rounded-lg ${getTierColor(loyaltyTier)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              <span className="font-semibold text-lg">{loyaltyTier} Member</span>
            </div>
            {discountPercentage > 0 && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="flex items-center gap-1 mb-1 opacity-90">
                <Gift className="h-3 w-3" />
                <span className="text-xs">Points</span>
              </div>
              <p className="font-bold text-lg">{loyaltyPoints}</p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1 opacity-90">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">Total Spent</span>
              </div>
              <p className="font-bold text-lg">₹{totalSpent.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1 opacity-90">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">Visits</span>
              </div>
              <p className="font-bold text-lg">{totalVisits}</p>
            </div>
          </div>

          {discountPercentage > 0 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs opacity-90">
                🎉 Enjoy {discountPercentage}% discount on all services and parts!
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
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
