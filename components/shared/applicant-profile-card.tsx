"use client";

import { MapPinIcon, GraduationCapIcon } from "lucide-react";
import { InfoRow } from "@/components/shared/info-row";

type ApplicantProfileCardProps = {
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  ctc?: number | null;
  basePay?: number | null;
  skills?: string[];
  experiences?: unknown;
};

export function ApplicantProfileCard({
  headline,
  bio,
  location,
  ctc,
  basePay,
  skills,
  experiences,
}: ApplicantProfileCardProps) {
  const experiencesArray = experiences != null && Array.isArray(experiences) ? (experiences as unknown[]) : null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
      <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider mb-4">Profile</h2>
      <div className="space-y-4">
        {headline && <p className="text-sm text-text-body font-medium">{headline}</p>}
        {bio && <p className="text-sm text-text-muted leading-relaxed">{bio}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow icon={<MapPinIcon className="size-5" />} label="Location" value={location ?? "Not specified"} />
          <InfoRow
            icon={<GraduationCapIcon className="size-5" />}
            label="Expected CTC"
            value={
              ctc != null
                ? `$${ctc.toLocaleString()}`
                : basePay != null
                  ? `$${basePay.toLocaleString()}/yr`
                  : "Not specified"
            }
          />
        </div>
        {skills && skills.length > 0 && (
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-radius-full bg-brand/10 text-brand border border-brand/20 px-2.5 py-0.5 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {experiencesArray && experiencesArray.length > 0 && (
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2">Experience</p>
            <div className="space-y-2">
              {experiencesArray.map((item, i) => {
                const exp = item as {
                  title?: string;
                  company?: string;
                  startDate?: string;
                  endDate?: string;
                };
                return (
                  <div key={i} className="text-sm text-text-body border-l-2 border-border-subtle pl-3">
                    {exp.title && <p className="font-medium">{exp.title}</p>}
                    {exp.company && <p className="text-text-muted text-xs">{exp.company}</p>}
                    {exp.startDate && (
                      <p className="text-text-muted text-xs">
                        {exp.startDate} – {exp.endDate ?? "Present"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
