import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallData {
  id: string;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  outcome: string | null;
  transcript: string | null;
  transcript_summary: string | null;
  recording_url: string | null;
  retell_call_id: string | null;
}

function scoreBadge(score: string | null) {
  switch (score) {
    case "HOT": return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Hot</Badge>;
    case "WARM": return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Warm</Badge>;
    case "COLD": return <Badge className="bg-primary/20 text-primary border-primary/30">Cold</Badge>;
    default: return <Badge variant="secondary">{score || "—"}</Badge>;
  }
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function CallTranscriptDialog({ call, open, onOpenChange }: { call: CallData | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!call) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Call Transcript</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {call.started_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(call.started_at).toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(call.duration_seconds)}
          </span>
          {scoreBadge(call.outcome)}
        </div>

        {call.transcript_summary && (
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Summary</p>
            <p className="text-sm">{call.transcript_summary}</p>
          </div>
        )}

        <ScrollArea className="flex-1 min-h-0 max-h-[400px] rounded-lg border p-4">
          {call.transcript ? (
            <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{call.transcript}</pre>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No transcript available for this call.</p>
          )}
        </ScrollArea>

        {call.recording_url && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <a href={call.recording_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Listen to Recording
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
