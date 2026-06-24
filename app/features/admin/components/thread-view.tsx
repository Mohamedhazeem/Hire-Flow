"use client";

type ThreadViewProps = {
  threadId: string;
};

export function ThreadView({ threadId }: ThreadViewProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-6">
      <p className="text-text-muted text-sm">
        {threadId.includes("_")
          ? "Conversation ready. Connect the messaging interface here."
          : "Invalid thread identifier."}
      </p>
    </div>
  );
}
