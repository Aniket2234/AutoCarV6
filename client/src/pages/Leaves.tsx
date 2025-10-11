import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Leaves() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: leaves = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/leaves"],
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "outline"} data-testid={`status-${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>;
  };

  const filteredLeaves = leaves.filter((leave: any) => {
    return leave.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.leaveType?.toLowerCase().includes(searchTerm.toLowerCase());
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
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load leave requests</h3>
              <p className="text-muted-foreground mb-4">
                {(error as Error)?.message || 'An error occurred while fetching leave requests'}
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
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <Button data-testid="button-create-leave">
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leave requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      {filteredLeaves.length > 0 ? (
        <div className="grid gap-4">
          {filteredLeaves.map((leave: any) => (
            <Card key={leave._id} className="hover-elevate" data-testid={`card-leave-${leave._id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{leave.employeeName}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{leave.leaveType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(leave.status)}
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm font-medium">{format(new Date(leave.startDate), 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="text-sm font-medium">{format(new Date(leave.endDate), 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Days</p>
                    <p className="text-sm font-medium">{leave.totalDays} day(s)</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-${leave._id}`}>
                      View
                    </Button>
                    {leave.status === 'pending' && (
                      <Button variant="outline" size="sm" className="flex-1" data-testid={`button-approve-${leave._id}`}>
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
                {leave.reason && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">Reason</p>
                    <p className="text-sm mt-1">{leave.reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : leaves.length > 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No leave requests match your search criteria</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No leave requests found.</p>
        </div>
      )}
    </div>
  );
}
