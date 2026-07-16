import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import {
  formatFileSize,
  fileIcon,
  formatTime,
  formatDateSeparator,
  getDayKey,
  MessageBubble,
} from "@/components/chat/message-bubble";

describe("formatFileSize", () => {
  it("returns bytes for < 1024", () => {
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("returns KB for < 1048576", () => {
    expect(formatFileSize(2048)).toBe("2.0 KB");
  });

  it("returns MB for >= 1048576", () => {
    expect(formatFileSize(5242880)).toBe("5.0 MB");
  });
});

describe("fileIcon", () => {
  it("returns ImageIcon for image mime types", () => {
    const icon = fileIcon("image/png") as ReactElement;
    const html = render(icon).container.innerHTML;
    expect(html).toContain("image");
  });

  it("returns FileTextIcon for PDF", () => {
    const icon = fileIcon("application/pdf") as ReactElement;
    const html = render(icon).container.innerHTML;
    expect(html).toContain("file-text");
  });

  it("returns FileIcon for unknown types", () => {
    const icon = fileIcon(null);
    expect(icon).toBeDefined();
  });
});

describe("formatTime", () => {
  it("returns localized time string", () => {
    const result = formatTime("2024-01-15T14:30:00Z");
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe("formatDateSeparator", () => {
  it("returns Today for today", () => {
    const today = new Date().toISOString();
    expect(formatDateSeparator(today)).toBe("Today");
  });

  it("returns Yesterday for yesterday", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(formatDateSeparator(yesterday)).toBe("Yesterday");
  });

  it("returns formatted date for older dates", () => {
    const oldDate = new Date(2020, 5, 15).toISOString();
    const result = formatDateSeparator(oldDate);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});

describe("getDayKey", () => {
  it("returns YYYY-M-D format", () => {
    expect(getDayKey("2024-01-15T14:30:00Z")).toMatch(/^\d{4}-\d{1,2}-\d{1,2}$/);
  });
});

describe("MessageBubble", () => {
  it("renders content text", () => {
    render(
      <MessageBubble
        content="Hello world"
        fileUrl={null}
        fileName={null}
        fileSize={null}
        fileType={null}
        createdAt={new Date().toISOString()}
        isOwn={false}
      />,
    );
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders file link for non-image attachments", () => {
    render(
      <MessageBubble
        content={null}
        fileUrl="https://example.com/doc.pdf"
        fileName="report.pdf"
        fileSize={102400}
        fileType="application/pdf"
        createdAt={new Date().toISOString()}
        isOwn={false}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com/doc.pdf");
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
  });

  it("renders delete button for own messages when onDelete provided", () => {
    render(
      <MessageBubble
        content="My message"
        fileUrl={null}
        fileName={null}
        fileSize={null}
        fileType={null}
        createdAt={new Date().toISOString()}
        isOwn={true}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByLabelText("Delete message")).toBeInTheDocument();
  });

  it("does not render delete button for other messages", () => {
    render(
      <MessageBubble
        content="Their message"
        fileUrl={null}
        fileName={null}
        fileSize={null}
        fileType={null}
        createdAt={new Date().toISOString()}
        isOwn={false}
      />,
    );
    expect(screen.queryByLabelText("Delete message")).not.toBeInTheDocument();
  });

  it("does not render delete button for own messages without onDelete prop", () => {
    render(
      <MessageBubble
        content="Own message"
        fileUrl={null}
        fileName={null}
        fileSize={null}
        fileType={null}
        createdAt={new Date().toISOString()}
        isOwn={true}
      />,
    );
    expect(screen.queryByLabelText("Delete message")).not.toBeInTheDocument();
  });

  it("renders deleting overlay when isDeleting", () => {
    const { container } = render(
      <MessageBubble
        content="Message"
        fileUrl={null}
        fileName={null}
        fileSize={null}
        fileType={null}
        createdAt={new Date().toISOString()}
        isOwn={true}
        onDelete={() => {}}
        isDeleting={true}
      />,
    );
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
