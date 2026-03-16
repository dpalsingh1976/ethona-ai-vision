import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  // null = waiting, true = recovery session ready, false = no valid session
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  useEffect(() => {
    // First, check if there's already a recovery session from the URL hash.
    // Supabase exchanges the token in the hash automatically on getSession().
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
      // Don't set false yet — wait for onAuthStateChange in case exchange is still in flight
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setSessionReady(true);
      } else if (event === "SIGNED_OUT" || (!session && sessionReady === null)) {
        // Only mark invalid if we've waited and got nothing
        setTimeout(() => {
          setSessionReady((prev) => (prev === null ? false : prev));
        }, 3000);
      }
    });

    // Fallback: if nothing fires after 5s, mark as invalid
    const timeout = setTimeout(() => {
      setSessionReady((prev) => (prev === null ? false : prev));
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      await supabase.auth.signOut();
      navigate("/ai-agent/auth", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Phone className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Ethona Voice Agent Cloud</h1>
          <p className="mt-2 text-sm text-muted-foreground">Set your new password below.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>
              {sessionReady === null
                ? "Verifying your reset link…"
                : sessionReady
                ? "Enter a new password for your account."
                : "This reset link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessionReady === null && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {sessionReady === false && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Please request a new password reset link.
                </p>
                <Button className="w-full" variant="outline" onClick={() => navigate("/ai-agent/auth")}>
                  Back to sign in
                </Button>
              </div>
            )}

            {sessionReady === true && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
