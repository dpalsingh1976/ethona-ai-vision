import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Appointments() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="mt-1 text-muted-foreground">Scheduled showings and meeting calendar.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><CalendarDays className="h-7 w-7 text-primary" /></div>
          <h3 className="mt-4 font-display text-lg font-semibold">No appointments yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">Booked showings will appear here when your agents start scheduling with qualified leads.</p>
        </CardContent>
      </Card>
    </div>
  );
}
