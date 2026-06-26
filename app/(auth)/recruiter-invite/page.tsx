import { prisma } from "@/lib/prisma";
import { AcceptInviteClient } from "./accept-invite-client";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export const metadata = {
  title: "Accept Team Invitation",
  description: "Accept your team invitation on HireFlow",
};

export default async function RecruiterInvitePage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page px-4">
        <div className="relative w-full max-w-md bg-bg-elevated/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-brand p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-text-heading">Invalid Link</h1>
          <p className="text-text-muted">
            This invitation link is missing a token. Please check the link and try again.
          </p>
        </div>
      </div>
    );
  }

  const invite = await prisma.recruiterInvite.findUnique({
    where: { token },
    select: { id: true, email: true, acceptedAt: true },
  });

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page px-4">
        <div className="relative w-full max-w-md bg-bg-elevated/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-brand p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-text-heading">Invalid Invitation</h1>
          <p className="text-text-muted">
            This invitation could not be found. It may have been cancelled or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  if (invite.acceptedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page px-4">
        <div className="relative w-full max-w-md bg-bg-elevated/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-brand p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-text-heading">Already Accepted</h1>
          <p className="text-text-muted">
            This invitation has already been accepted.
          </p>
        </div>
      </div>
    );
  }

  return <AcceptInviteClient token={token} email={invite.email} />;
}
