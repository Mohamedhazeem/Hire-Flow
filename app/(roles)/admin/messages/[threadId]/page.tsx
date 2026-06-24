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
  return <ThreadView threadId={threadId} />;
}