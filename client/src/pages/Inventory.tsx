import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useState } from "react";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");

  // todo: remove mock functionality
  const inventoryMovements = [
    {
      id: "1",
      product: "Engine Oil Filter - Mann W 712/75",
      type: "IN",
      quantity: 50,
      reason: "Purchase Order #PO-2024-012",
      date: "Jan 15, 2024",
      user: "Admin User",
    },
    {
      id: "2",
      product: "Brake Pads Set - Front",
      type: "OUT",
      quantity: 2,
      reason: "Service Order #ORD-2024-001",
      date: "Jan 15, 2024",
      user: "Mike Johnson",
    },
    {
      id: "3",
      product: "Air Filter - K&N 33-2304",
      type: "OUT",
      quantity: 1,
      reason: "Customer Purchase",
      date: "Jan 14, 2024",
      user: "David Lee",
    },
    {
      id: "4",
      product: "Spark Plugs Set (4pc)",
      type: "IN",
      quantity: 30,
      reason: "Stock Replenishment",
      date: "Jan 13, 2024",
      user: "Admin User",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track stock movements and manage inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-stock-in">
            <ArrowUpCircle className="h-4 w-4 mr-2 text-success" />
            Stock In
          </Button>
          <Button variant="outline" data-testid="button-stock-out">
            <ArrowDownCircle className="h-4 w-4 mr-2 text-destructive" />
            Stock Out
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory movements..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-inventory"
        />
      </div>

      <DataTable
        columns={[
          { header: "Product", accessor: "product" },
          {
            header: "Type",
            accessor: (row) => (
              <Badge
                variant="outline"
                className={
                  row.type === "IN"
                    ? "border-success/20 bg-success/10 text-success"
                    : "border-destructive/20 bg-destructive/10 text-destructive"
                }
              >
                {row.type === "IN" ? (
                  <ArrowUpCircle className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownCircle className="h-3 w-3 mr-1" />
                )}
                {row.type}
              </Badge>
            ),
          },
          { header: "Quantity", accessor: "quantity", className: "text-right" },
          { header: "Reason", accessor: "reason" },
          { header: "Date", accessor: "date" },
          { header: "User", accessor: "user" },
        ]}
        data={inventoryMovements}
        onRowClick={(row) => console.log("Movement clicked:", row)}
      />
    </div>
  );
}
