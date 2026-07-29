"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/app/features/auth/components/auth-layout";
import { Button } from "@/components/ui/button";
import { authClient } from "@/app/features/auth/libs/auth-client";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

type AcceptInviteClientProps = {
  token: string;
  email: string;
};

export function AcceptInviteClient({ token, email }: AcceptInviteClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "logged-out" | "accepting" | "accepted" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const acceptInvite = useCallback(async () => {
    setStatus("accepting");
    try {
      const res = await fetch("/api/admin/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to accept invitation");
      }

      setStatus("accepted");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }, [token]);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          await acceptInvite();
        } else {
          setStatus("logged-out");
        }
      } catch {
        setStatus("logged-out");
      }
    }
    checkSession();
  }, [acceptInvite]);

  if (status === "loading") {
    return (
      <AuthLayout title="Checking Invitation" subtitle="Verifying your invitation...">
        <div className="flex justify-center py-8">
          <Loader2 className="size-8 animate-spin text-text-muted" />
        </div>
      </AuthLayout>
    );
  }

  if (status === "logged-out") {
    return (
      <AuthLayout title="Admin Invitation" subtitle={`You've been invited as an admin`}>
        <div className="space-y-4 text-center">
          <p className="text-sm text-text-muted">
            Invitation sent to: <span className="font-medium text-text-heading">{email}</span>
          </p>
          <p className="text-sm text-text-muted">
            Sign in to your existing account or create a new one to accept this invitation.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/admin-invite?token=${token}`)}`)}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/register?redirect=${encodeURIComponent(`/admin-invite?token=${token}`)}`)}
            >
              Create Account
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (status === "accepting") {
    return (
      <AuthLayout title="Accepting Invitation" subtitle="Please wait...">
        <div className="flex justify-center py-8">
          <Loader2 className="size-8 animate-spin text-text-muted" />
        </div>
      </AuthLayout>
    );
  }

  if (status === "accepted") {
    return (
      <AuthLayout title="Welcome to the Team!" subtitle="You are now an admin">
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle className="size-12 text-success" />
          <p className="text-sm text-text-muted text-center">You now have admin access to the platform.</p>
          <Button onClick={() => router.push("/admin")}>Go to Dashboard</Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Invitation Failed" subtitle="Could not accept invitation">
      <div className="flex flex-col items-center gap-4 py-4">
        <XCircle className="size-12 text-error" />
        <p className="text-sm text-error text-center">{errorMessage}</p>
        <Button variant="outline" onClick={() => acceptInvite()}>
          Try Again
        </Button>
      </div>
    </AuthLayout>
  );
}
