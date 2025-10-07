import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, TrendingUp, Package, Users, DollarSign } from "lucide-react";

export default function Reports() {
  // todo: remove mock functionality
  const reportCards = [
    {
      title: "Sales Report",
      description: "Daily and monthly sales analysis with trends",
      icon: DollarSign,
      value: "₹4,52,300",
      period: "This Month",
    },
    {
      title: "Inventory Movement",
      description: "Stock in/out tracking and analysis",
      icon: Package,
      value: "284",
      period: "Total Transactions",
    },
    {
      title: "Top Products",
      description: "Best selling products and categories",
      icon: TrendingUp,
      value: "15",
      period: "Active Products",
    },
    {
      title: "Customer Analytics",
      description: "Customer visits and service patterns",
      icon: Users,
      value: "127",
      period: "Active Customers",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="month">
            <SelectTrigger className="w-[180px]" data-testid="select-report-period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export-report">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reportCards.map((report) => (
          <Card key={report.title} className="hover-elevate cursor-pointer" data-testid={`report-${report.title.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <report.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-sm text-muted-foreground font-normal mt-1">
                    {report.description}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{report.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{report.period}</p>
                </div>
                <Button variant="ghost" size="sm" data-testid={`button-view-${report.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Profit/Loss Summary",
            "Stock Aging Report",
            "Employee Performance",
            "Payment Due Summary",
            "Service Completion Rate",
          ].map((report) => (
            <div
              key={report}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover-elevate"
            >
              <span className="font-medium">{report}</span>
              <Button variant="outline" size="sm" data-testid={`button-generate-${report.toLowerCase().replace(/\s+/g, "-")}`}>
                <Download className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
