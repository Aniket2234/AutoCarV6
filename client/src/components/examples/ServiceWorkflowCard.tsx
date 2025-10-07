import { ServiceWorkflowCard } from "../ServiceWorkflowCard";

export default function ServiceWorkflowCardExample() {
  return (
    <div className="p-6 bg-background max-w-sm">
      <ServiceWorkflowCard
        customerName="John Smith"
        vehicleReg="ABC-1234"
        status="working"
        handler="Mike Johnson"
        startTime="2h ago"
        onClick={() => console.log("Service card clicked")}
      />
    </div>
  );
}
