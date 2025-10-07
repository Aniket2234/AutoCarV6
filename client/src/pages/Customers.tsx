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
      name: "Rajesh Kumar",
      phone: "+91 98765-43210",
      email: "rajesh.kumar@email.com",
      vehicle: "Maruti Swift - MH-12-AB-1234",
      totalVisits: 8,
      lastVisit: "15 Jan, 2024",
      detailedInfo: {
        vehicle: {
          regNo: "MH-12-AB-1234",
          make: "Maruti Suzuki",
          model: "Swift",
          year: 2020,
        },
        totalVisits: 8,
        lastHandler: "Amit Sharma",
        currentHandler: "Priya Patel",
        recentVisits: [
          {
            date: "15 Jan, 2024",
            handler: "Amit Sharma",
            status: "Completed",
            parts: ["Engine Oil", "Oil Filter"],
          },
          {
            date: "10 Dec, 2023",
            handler: "Priya Patel",
            status: "Completed",
            parts: ["Brake Pads", "Brake Fluid"],
          },
        ],
      },
    },
    {
      id: "2",
      name: "Priya Patel",
      phone: "+91 98765-43211",
      email: "priya.patel@email.com",
      vehicle: "Hyundai i20 - DL-8C-XY-5678",
      totalVisits: 5,
      lastVisit: "12 Jan, 2024",
      detailedInfo: {
        vehicle: {
          regNo: "DL-8C-XY-5678",
          make: "Hyundai",
          model: "i20",
          year: 2019,
        },
        totalVisits: 5,
        lastHandler: "Vikram Singh",
        recentVisits: [
          {
            date: "12 Jan, 2024",
            handler: "Vikram Singh",
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
