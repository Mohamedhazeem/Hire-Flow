import { PageHeader } from "@/components/layout/page-header";
import { ThreadView } from "@/app/features/admin/components/thread-view";

export const metadata = {
  title: "Messages",
  description: "View and send messages",
};

type Props = {
  params: Promise<{ threadId: string }>;
};

export default async function AdminMessageThreadPage({ params }: Props) {
  const { threadId } = await params;
  const parts = threadId.split("_");

  const isValid =
    parts.length === 2 &&
    parts[0]!.length > 0 &&
    parts[1]!.length > 0;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Messages"
        description={isValid ? `Thread: ${threadId}` : "Invalid thread"}
      />
      <div className="flex-1 mt-4">
        <ThreadView threadId={threadId} />
      </div>
    </div>
  );
}
