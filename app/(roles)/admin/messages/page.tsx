import { PageHeader } from "@/components/layout/page-header";
import { StartThreadSearch } from "@/app/features/admin/components/start-thread-search";

export const metadata = {
  title: "Messages",
  description: "Send and manage direct messages to users and recruiters",
};

export default function AdminMessagesPage() {
  return (
    <div className="flex h-full gap-6">
      <div className="w-80 shrink-0 border-r border-border-subtle pr-6">
        <PageHeader
          title="Messages"
          description="Start a new conversation"
        />
        <div className="mt-4">
          <StartThreadSearch />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-muted text-sm">
          Select a conversation or start a new thread to get started
        </p>
      </div>
    </div>
  );
}
