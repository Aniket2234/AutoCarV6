import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, User, Bell, Lock, Palette } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);

  const handleSaveProfile = () => {
    toast({
      title: 'Settings saved',
      description: 'Your profile settings have been updated.',
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Notifications updated',
      description: 'Your notification preferences have been saved.',
    });
  };

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-8 w-8" />
        <h1 className="text-3xl font-bold" data-testid="text-title">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList data-testid="tabs-settings">
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" data-testid="tab-appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card data-testid="card-profile-settings">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" data-testid="label-name">Full Name</Label>
                  <Input id="name" defaultValue={user?.name} data-testid="input-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" data-testid="label-email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email} data-testid="input-email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" data-testid="label-phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" data-testid="input-phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" data-testid="label-role">Role</Label>
                  <Input id="role" value={user?.role} disabled className="bg-muted" data-testid="input-role" />
                </div>
              </div>
              <Button onClick={handleSaveProfile} data-testid="button-save-profile">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card data-testid="card-notification-settings">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label data-testid="label-email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  data-testid="switch-email-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label data-testid="label-push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  data-testid="switch-push-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label data-testid="label-order-alerts">Order Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new orders</p>
                </div>
                <Switch
                  checked={orderAlerts}
                  onCheckedChange={setOrderAlerts}
                  data-testid="switch-order-alerts"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label data-testid="label-stock-alerts">Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when stock is low</p>
                </div>
                <Switch
                  checked={stockAlerts}
                  onCheckedChange={setStockAlerts}
                  data-testid="switch-stock-alerts"
                />
              </div>
              <Button onClick={handleSaveNotifications} data-testid="button-save-notifications">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card data-testid="card-security-settings">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" data-testid="label-current-password">Current Password</Label>
                <Input id="current-password" type="password" data-testid="input-current-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" data-testid="label-new-password">New Password</Label>
                <Input id="new-password" type="password" data-testid="input-new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" data-testid="label-confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" data-testid="input-confirm-password" />
              </div>
              <Button data-testid="button-change-password">Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card data-testid="card-appearance-settings">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label data-testid="label-theme">Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Use the theme toggle in the header to switch between light and dark mode
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
