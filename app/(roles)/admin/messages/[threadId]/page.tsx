import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ threadId: string }>;
};

export default async function AdminMessageThreadRedirect({ params }: Props) {
  const { threadId } = await params;
  redirect(`/admin/messages?thread=${threadId}`);
}
