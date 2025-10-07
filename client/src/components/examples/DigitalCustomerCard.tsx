import { DigitalCustomerCard } from "../DigitalCustomerCard";

export default function DigitalCustomerCardExample() {
  return (
    <div className="p-6 bg-background">
      <DigitalCustomerCard
        customer={{
          name: "John Smith",
          phone: "+1 234-567-8900",
          email: "john.smith@email.com",
          vehicle: {
            regNo: "ABC-1234",
            make: "Toyota",
            model: "Camry",
            year: 2020,
          },
        }}
        totalVisits={8}
        lastHandler="Mike Johnson"
        currentHandler="Sarah Williams"
        recentVisits={[
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
        ]}
      />
    </div>
  );
}
