import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Printer } from "lucide-react";
import { useState } from "react";

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");

  // todo: remove mock functionality
  const orders = [
    {
      id: "ORD-2024-001",
      customer: "John Smith",
      date: "Jan 15, 2024",
      items: 3,
      total: "$245.50",
      paymentStatus: "paid",
      salesperson: "Mike Johnson",
    },
    {
      id: "ORD-2024-002",
      customer: "Sarah Williams",
      date: "Jan 14, 2024",
      items: 2,
      total: "$180.00",
      paymentStatus: "partial",
      salesperson: "David Lee",
    },
    {
      id: "ORD-2024-003",
      customer: "Robert Brown",
      date: "Jan 14, 2024",
      items: 5,
      total: "$425.75",
      paymentStatus: "due",
      salesperson: "Emily Chen",
    },
    {
      id: "ORD-2024-004",
      customer: "Lisa Anderson",
      date: "Jan 13, 2024",
      items: 1,
      total: "$65.00",
      paymentStatus: "paid",
      salesperson: "Mike Johnson",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage sales orders and invoices</p>
        </div>
        <Button data-testid="button-new-order">
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders by ID or customer name..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-orders"
        />
      </div>

      <DataTable
        columns={[
          { header: "Order ID", accessor: "id" },
          { header: "Customer", accessor: "customer" },
          { header: "Date", accessor: "date" },
          { header: "Items", accessor: "items", className: "text-right" },
          { header: "Total", accessor: "total", className: "text-right" },
          {
            header: "Payment",
            accessor: (row) => <StatusBadge type="payment" status={row.paymentStatus as any} />,
          },
          { header: "Salesperson", accessor: "salesperson" },
          {
            header: "Actions",
            accessor: (row) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Print invoice:", row.id);
                }}
                data-testid={`button-print-${row.id}`}
              >
                <Printer className="h-4 w-4" />
              </Button>
            ),
            className: "text-right",
          },
        ]}
        data={orders}
        onRowClick={(row) => console.log("Order clicked:", row)}
      />
    </div>
  );
}
