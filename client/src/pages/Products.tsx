import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

export default function Products() {
  // todo: remove mock functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const products = [
    {
      id: "1",
      name: "Engine Oil Filter - Mann W 712/75",
      category: "Engine Parts",
      brand: "Mann-Filter",
      mrp: "$45.00",
      selling: "$38.50",
      stock: 45,
      status: "in_stock",
    },
    {
      id: "2",
      name: "Brake Pads Set - Front",
      category: "Brake System",
      brand: "Brembo",
      mrp: "$120.00",
      selling: "$98.00",
      stock: 12,
      status: "low_stock",
    },
    {
      id: "3",
      name: "Air Filter - K&N 33-2304",
      category: "Engine Parts",
      brand: "K&N",
      mrp: "$65.00",
      selling: "$55.00",
      stock: 0,
      status: "out_of_stock",
    },
    {
      id: "4",
      name: "Spark Plugs Set (4pc)",
      category: "Ignition System",
      brand: "NGK",
      mrp: "$32.00",
      selling: "$28.50",
      stock: 28,
      status: "in_stock",
    },
    {
      id: "5",
      name: "Cabin Air Filter",
      category: "HVAC",
      brand: "Bosch",
      mrp: "$25.00",
      selling: "$21.00",
      stock: 18,
      status: "low_stock",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your car parts inventory</p>
        </div>
        <Button data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-products"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-category-filter">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="engine">Engine Parts</SelectItem>
            <SelectItem value="brake">Brake System</SelectItem>
            <SelectItem value="ignition">Ignition System</SelectItem>
            <SelectItem value="hvac">HVAC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={[
          { header: "Product Name", accessor: "name" },
          { header: "Category", accessor: "category" },
          { header: "Brand", accessor: "brand" },
          { header: "MRP", accessor: "mrp", className: "text-right" },
          { header: "Selling Price", accessor: "selling", className: "text-right" },
          { header: "Stock", accessor: "stock", className: "text-right" },
          {
            header: "Status",
            accessor: (row) => <StatusBadge type="stock" status={row.status as any} />,
            className: "text-right",
          },
        ]}
        data={products}
        onRowClick={(row) => console.log("Product clicked:", row)}
      />
    </div>
  );
}
