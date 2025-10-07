import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");

  // todo: remove mock functionality
  const employees = [
    {
      id: "1",
      name: "Amit Sharma",
      role: "Service Staff",
      contact: "+91 98765-43210",
      joiningDate: "15 Jan, 2023",
      isActive: true,
    },
    {
      id: "2",
      name: "Priya Patel",
      role: "Service Staff",
      contact: "+91 98765-43211",
      joiningDate: "22 Mar, 2023",
      isActive: true,
    },
    {
      id: "3",
      name: "Vikram Singh",
      role: "Inventory Manager",
      contact: "+91 98765-43212",
      joiningDate: "10 Jun, 2022",
      isActive: true,
    },
    {
      id: "4",
      name: "Sneha Reddy",
      role: "Sales Executive",
      contact: "+91 98765-43213",
      joiningDate: "5 Aug, 2023",
      isActive: true,
    },
    {
      id: "5",
      name: "Rahul Deshmukh",
      role: "HR Manager",
      contact: "+91 98765-43214",
      joiningDate: "28 Feb, 2022",
      isActive: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage staff profiles and roles</p>
        </div>
        <Button data-testid="button-add-employee">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-employees"
        />
      </div>

      <DataTable
        columns={[
          {
            header: "Employee",
            accessor: (row) => {
              const initials = row.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();
              return (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{row.name}</span>
                </div>
              );
            },
          },
          { header: "Role", accessor: "role" },
          { header: "Contact", accessor: "contact" },
          { header: "Joining Date", accessor: "joiningDate" },
          {
            header: "Status",
            accessor: (row) => (
              <Badge
                variant="outline"
                className={
                  row.isActive
                    ? "border-success/20 bg-success/10 text-success"
                    : "border-muted bg-muted text-muted-foreground"
                }
              >
                {row.isActive ? "Active" : "Inactive"}
              </Badge>
            ),
            className: "text-right",
          },
        ]}
        data={employees}
        onRowClick={(row) => console.log("Employee clicked:", row)}
      />
    </div>
  );
}
