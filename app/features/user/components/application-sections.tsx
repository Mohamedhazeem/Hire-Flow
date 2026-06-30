"use client";

import { ExternalLinkIcon } from "lucide-react";

type Props = {
  rejectionReason: string | null;
  interviewDate: string | null;
  meetingLink: string | null;
  offerDetails: string | null;
};

export function ApplicationSections({ rejectionReason, interviewDate, meetingLink, offerDetails }: Props) {
  return (
    <>
      {rejectionReason != null && (
        <div className="bg-error/5 border border-error/20 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-2">Rejection Reason</h2>
          <p className="text-sm text-text-body">{rejectionReason}</p>
        </div>
      )}

      {interviewDate != null && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-2">Interview</h2>
          <p className="text-sm text-text-body">
            {new Date(interviewDate).toLocaleDateString(undefined, {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
          {meetingLink != null && (
            <a href={meetingLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-brand hover:underline mt-2">
              <ExternalLinkIcon className="size-3.5" /> Join Meeting
            </a>
          )}
        </div>
      )}

      {offerDetails != null && (
        <div className="bg-success/5 border border-success/20 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-2">Offer Details</h2>
          <p className="text-sm text-text-body whitespace-pre-line">{offerDetails}</p>
        </div>
      )}
    </>
  );
}
