import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Mail, Database, Info } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage application settings and configuration</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mongo-uri">MongoDB URI</Label>
              <Input
                id="mongo-uri"
                type="password"
                placeholder="mongodb+srv://..."
                data-testid="input-mongodb-uri"
              />
              <p className="text-xs text-muted-foreground">
                Your MongoDB connection string will be securely stored
              </p>
            </div>
            <Button data-testid="button-test-connection">Test Connection</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications (SMTP)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" placeholder="smtp.gmail.com" data-testid="input-smtp-host" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" placeholder="587" data-testid="input-smtp-port" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-user">SMTP User</Label>
                <Input id="smtp-user" placeholder="your@email.com" data-testid="input-smtp-user" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-pass">SMTP Password</Label>
                <Input id="smtp-pass" type="password" data-testid="input-smtp-pass" />
              </div>
            </div>
            <Button data-testid="button-save-smtp">Save SMTP Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Roles & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { role: "Admin", permissions: "Full system access" },
              { role: "Inventory Manager", permissions: "Manage products and stock" },
              { role: "Sales Executive", permissions: "Create orders and invoices" },
              { role: "HR Manager", permissions: "Manage employees and attendance" },
              { role: "Service Staff", permissions: "Handle service visits" },
            ].map((item) => (
              <div
                key={item.role}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium">{item.role}</p>
                  <p className="text-sm text-muted-foreground">{item.permissions}</p>
                </div>
                <Button variant="outline" size="sm" data-testid={`button-edit-${item.role.toLowerCase().replace(/\s+/g, "-")}`}>
                  Edit
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Application Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-mono">v1.0.0</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment</span>
                <span className="font-mono">Development</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database Status</span>
                <span className="text-warning font-medium">Not Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
