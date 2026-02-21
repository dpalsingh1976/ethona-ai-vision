import { Building2, Users, Puzzle, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  { title: "Organization", description: "Manage your organization name, service area, and details.", icon: Building2 },
  { title: "Team Members", description: "Invite teammates and manage roles (Owner, Admin, Agent, Viewer).", icon: Users },
  { title: "Integrations", description: "Connect Retell AI, Calendar, and other services.", icon: Puzzle },
  { title: "Branding", description: "Upload your logo and customize colors for white-label.", icon: Palette },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Configure your organization, team, and integrations.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="cursor-pointer hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><section.icon className="h-5 w-5 text-primary" /></div>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{section.description}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
