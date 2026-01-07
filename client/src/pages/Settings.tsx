import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-16">
        <Card className="border-2">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <SettingsIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Account Settings</CardTitle>
            <CardDescription className="text-base mt-4">
              Manage your account preferences and security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-lg font-semibold mb-2">Coming Soon</p>
              <p className="text-muted-foreground">
                Account settings including password management, notification preferences,
                and privacy controls are currently in development.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
