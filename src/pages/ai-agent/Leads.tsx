import { Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Leads() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Leads</h1>
        <p className="mt-1 text-muted-foreground">Track and manage qualified buyer leads from your AI agents.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Inbox className="h-7 w-7 text-primary" /></div>
          <h3 className="mt-4 font-display text-lg font-semibold">No leads yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">Leads will appear here once your agents start answering calls and qualifying buyers.</p>
        </CardContent>
      </Card>
    </div>
  );
}
