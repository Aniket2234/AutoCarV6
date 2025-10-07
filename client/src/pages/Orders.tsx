import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/orders"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredOrders = orders.filter((order: any) =>
    order.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" data-testid={`payment-paid`}>Paid</Badge>;
      case "partial":
        return <Badge variant="secondary" data-testid={`payment-partial`}>Partial</Badge>;
      case "due":
        return <Badge variant="destructive" data-testid={`payment-due`}>Due</Badge>;
      default:
        return <Badge variant="outline" data-testid={`payment-${status}`}>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load orders</h3>
              <p className="text-muted-foreground mb-4">
                {(error as Error)?.message || 'An error occurred while fetching orders'}
              </p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button data-testid="button-new-order">
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      {filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order: any) => (
            <Card key={order._id} className="hover-elevate" data-testid={`card-order-${order._id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{order.invoiceNumber || 'N/A'}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName || order.customerId?.name || 'Walk-in Customer'}
                      </p>
                    </div>
                  </div>
                  {getPaymentStatusBadge(order.paymentStatus)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium">{format(new Date(order.createdAt), 'dd MMM, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Items</p>
                    <p className="text-sm font-medium">{order.items?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Salesperson</p>
                    <p className="text-sm font-medium">{order.salespersonId?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" data-testid={`button-view-${order._id}`}>
                    View Details
                  </Button>
                  {order.paymentStatus !== 'paid' && (
                    <Button variant="outline" size="sm" data-testid={`button-payment-${order._id}`}>
                      Record Payment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders match your search criteria</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders found. Create your first order to get started.</p>
        </div>
      )}
    </div>
  );
}
