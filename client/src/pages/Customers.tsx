import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DigitalCustomerCard } from "@/components/DigitalCustomerCard";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // todo: remove mock functionality
  const customers = [
    {
      id: "1",
      name: "John Smith",
      phone: "+1 234-567-8900",
      email: "john.smith@email.com",
      vehicle: "Toyota Camry - ABC-1234",
      totalVisits: 8,
      lastVisit: "Jan 15, 2024",
      detailedInfo: {
        vehicle: {
          regNo: "ABC-1234",
          make: "Toyota",
          model: "Camry",
          year: 2020,
        },
        totalVisits: 8,
        lastHandler: "Mike Johnson",
        currentHandler: "Sarah Williams",
        recentVisits: [
          {
            date: "Jan 15, 2024",
            handler: "Mike Johnson",
            status: "Completed",
            parts: ["Engine Oil", "Oil Filter"],
          },
          {
            date: "Dec 10, 2023",
            handler: "Sarah Williams",
            status: "Completed",
            parts: ["Brake Pads", "Brake Fluid"],
          },
        ],
      },
    },
    {
      id: "2",
      name: "Sarah Williams",
      phone: "+1 234-567-8901",
      email: "sarah.w@email.com",
      vehicle: "Honda Accord - XYZ-5678",
      totalVisits: 5,
      lastVisit: "Jan 12, 2024",
      detailedInfo: {
        vehicle: {
          regNo: "XYZ-5678",
          make: "Honda",
          model: "Accord",
          year: 2019,
        },
        totalVisits: 5,
        lastHandler: "David Lee",
        recentVisits: [
          {
            date: "Jan 12, 2024",
            handler: "David Lee",
            status: "Completed",
            parts: ["Air Filter", "Cabin Filter"],
          },
        ],
      },
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground mt-1">Manage customer profiles and service history</p>
          </div>
          <Button data-testid="button-add-customer">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or registration number..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-customers"
          />
        </div>

        <DataTable
          columns={[
            { header: "Customer Name", accessor: "name" },
            { header: "Phone", accessor: "phone" },
            { header: "Email", accessor: "email" },
            { header: "Vehicle", accessor: "vehicle" },
            { header: "Total Visits", accessor: "totalVisits", className: "text-right" },
            { header: "Last Visit", accessor: "lastVisit", className: "text-right" },
          ]}
          data={customers}
          onRowClick={(row) => setSelectedCustomer(row)}
        />
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Digital Customer Card</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <DigitalCustomerCard
              customer={{
                name: selectedCustomer.name,
                phone: selectedCustomer.phone,
                email: selectedCustomer.email,
                vehicle: selectedCustomer.detailedInfo.vehicle,
              }}
              totalVisits={selectedCustomer.detailedInfo.totalVisits}
              lastHandler={selectedCustomer.detailedInfo.lastHandler}
              currentHandler={selectedCustomer.detailedInfo.currentHandler}
              recentVisits={selectedCustomer.detailedInfo.recentVisits}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
