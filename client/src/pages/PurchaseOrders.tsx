import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: purchaseOrders = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/purchase-orders"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      completed: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"} data-testid={`status-${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>;
  };

  const filteredOrders = purchaseOrders.filter((order: any) => {
    return order.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load purchase orders</h3>
              <p className="text-muted-foreground mb-4">
                {(error as Error)?.message || 'An error occurred while fetching purchase orders'}
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
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
        <Button data-testid="button-create-po">
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by PO number or supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      {filteredOrders.length > 0 ? (
        <div className="grid gap-4">
          {filteredOrders.map((po: any) => (
            <Card key={po._id} className="hover-elevate" data-testid={`card-po-${po._id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">PO #{po.poNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{po.supplierName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(po.status)}
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Order Date</p>
                    <p className="text-sm font-medium">{format(new Date(po.orderDate), 'dd MMM yyyy')}</p>
                  </div>
                  {po.expectedDelivery && (
                    <div>
                      <p className="text-xs text-muted-foreground">Expected Delivery</p>
                      <p className="text-sm font-medium">{format(new Date(po.expectedDelivery), 'dd MMM yyyy')}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="text-sm font-bold">{formatCurrency(po.totalAmount)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-${po._id}`}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" data-testid={`button-edit-${po._id}`}>
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : purchaseOrders.length > 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No purchase orders match your search criteria</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No purchase orders found. Create your first purchase order to get started.</p>
        </div>
      )}
    </div>
  );
}
