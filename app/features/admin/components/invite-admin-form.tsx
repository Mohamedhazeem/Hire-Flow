"use client";

import { useState } from "react";
import { TabSwitcher } from "@/components/shared/tab-switcher";
import { InviteSingleForm } from "./invite-single-form";
import { InviteBulkForm } from "./invite-bulk-form";
import { Mail, Users } from "lucide-react";

const TABS = [
  { value: "single" as const, label: "Single", icon: <Mail className="size-4" /> },
  { value: "bulk" as const, label: "Bulk", icon: <Users className="size-4" /> },
];

export function InviteAdminForm() {
  const [tab, setTab] = useState<"single" | "bulk">("single");

  return (
    <div className="space-y-4">
      <TabSwitcher tabs={TABS} active={tab} onChange={setTab} />
      {tab === "single" ? <InviteSingleForm /> : <InviteBulkForm />}
    </div>
  );
}
