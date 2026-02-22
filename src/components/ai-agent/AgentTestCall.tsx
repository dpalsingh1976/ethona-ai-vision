import { useState, useEffect, useRef, useCallback } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { Phone, PhoneOff, Mic, MicOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Agent } from "@/hooks/useAgents";

type CallStatus = "idle" | "connecting" | "active" | "ended" | "error";

interface AgentTestCallProps {
  agent: Agent;
  onClose: () => void;
}

export function AgentTestCall({ agent, onClose }: AgentTestCallProps) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [isAgentTalking, setIsAgentTalking] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const clientRef = useRef<RetellWebClient | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (clientRef.current) {
      clientRef.current.stopCall();
      clientRef.current.removeAllListeners();
      clientRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const startCall = async () => {
    setStatus("connecting");
    try {
      const { data, error } = await supabase.functions.invoke("create-web-call", {
        body: { agent_id: agent.id },
      });
      if (error || !data?.access_token) {
        throw new Error(error?.message || "No access token returned");
      }

      const client = new RetellWebClient();
      clientRef.current = client;

      client.on("call_started", () => {
        setStatus("active");
        setSeconds(0);
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      });
      client.on("call_ended", () => {
        setStatus("ended");
        if (timerRef.current) clearInterval(timerRef.current);
      });
      client.on("agent_start_talking", () => setIsAgentTalking(true));
      client.on("agent_stop_talking", () => setIsAgentTalking(false));
      client.on("error", (e: unknown) => {
        console.error("Retell error:", e);
        setStatus("error");
        if (timerRef.current) clearInterval(timerRef.current);
        toast({ title: "Call error", description: String(e), variant: "destructive" });
      });

      await client.startCall({ accessToken: data.access_token });
    } catch (err) {
      console.error("Start call failed:", err);
      setStatus("error");
      toast({ title: "Failed to start call", description: String(err), variant: "destructive" });
    }
  };

  const endCall = () => {
    cleanup();
    setStatus("ended");
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-display">Test Call — {agent.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => { cleanup(); onClose(); }}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pb-8">
          {/* Status indicator */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full transition-all duration-500 ${
                status === "active"
                  ? isAgentTalking
                    ? "bg-primary/20 ring-4 ring-primary/40 animate-pulse"
                    : "bg-primary/10 ring-2 ring-primary/20"
                  : status === "connecting"
                    ? "bg-muted animate-pulse"
                    : status === "error"
                      ? "bg-destructive/10"
                      : "bg-muted"
              }`}
            >
              {status === "active" ? (
                isAgentTalking ? <Mic className="h-10 w-10 text-primary" /> : <MicOff className="h-10 w-10 text-muted-foreground" />
              ) : (
                <Phone className="h-10 w-10 text-muted-foreground" />
              )}
            </div>

            <Badge variant={
              status === "active" ? "default" :
              status === "connecting" ? "secondary" :
              status === "error" ? "destructive" : "outline"
            }>
              {status === "idle" && "Ready"}
              {status === "connecting" && "Connecting…"}
              {status === "active" && (isAgentTalking ? "Agent speaking" : "Listening")}
              {status === "ended" && "Call ended"}
              {status === "error" && "Error"}
            </Badge>

            {(status === "active" || status === "ended") && (
              <span className="font-mono text-2xl text-foreground">{formatTime(seconds)}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {(status === "idle" || status === "ended" || status === "error") && (
              <Button onClick={startCall} className="gap-2">
                <Phone className="h-4 w-4" />
                {status === "idle" ? "Start Call" : "Retry"}
              </Button>
            )}
            {(status === "connecting" || status === "active") && (
              <Button variant="destructive" onClick={endCall} className="gap-2">
                <PhoneOff className="h-4 w-4" />
                End Call
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Your browser will request microphone access. Speak naturally — the AI agent will respond in real time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
