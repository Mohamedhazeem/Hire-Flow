"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/api-client";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export function AcceptInviteClient({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);

    try {
      await apiClient("/api/recruiter/invite/accept", {
        method: "POST",
        body: { token },
      });
      setSuccess(true);
      setTimeout(() => router.push("/recruiter"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    router.push(`/register?invite_token=${token}`);
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page px-4">
        <div className="relative w-full max-w-md bg-bg-elevated/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-brand p-8 text-center space-y-4">
          <Loader2 className="size-8 text-text-muted animate-spin mx-auto" />
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  const hasMatchingSession = session?.user?.email === email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page px-4">
      <div className="relative w-full max-w-md bg-bg-elevated/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-brand p-8 text-center space-y-5">
        {success ? (
          <>
            <CheckCircle className="size-12 text-success mx-auto" />
            <h1 className="text-2xl font-bold text-text-heading">Invitation Accepted</h1>
            <p className="text-text-muted">You are now a member of the team. Redirecting to your dashboard...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-text-heading">Team Invitation</h1>
            <p className="text-text-muted">
              You&apos;ve been invited to join a recruitment team on <strong>HireFlow</strong> as{" "}
              <strong>{email}</strong>.
            </p>

            {hasMatchingSession ? (
              <div className="space-y-3">
                <p className="text-sm text-text-muted">
                  You are logged in as {session?.user?.email}. Click below to accept.
                </p>
                <Button onClick={handleAccept} disabled={loading} className="w-full">
                  {loading ? "Accepting..." : "Accept Invitation"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-text-muted">
                  You need an account with the email <strong>{email}</strong> to accept this invitation.
                </p>
                <Button onClick={handleSignUpRedirect} variant="default" className="w-full">
                  Create Account
                </Button>
                <p className="text-xs text-text-muted">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push(`/login?invite_token=${token}`)}
                    className="text-text-heading underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-error">
                <AlertCircle className="size-4" />
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
