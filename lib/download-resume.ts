export async function downloadResume(fileUrl: string, onError: (msg: string) => void): Promise<void> {
  try {
    const res = await fetch(`/api/files/download?path=${encodeURIComponent(fileUrl)}`);
    if (!res.ok) { onError("File unavailable — removed by applicant"); return; }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct || ct.startsWith("text/html")) { onError("Server returned an unexpected response"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileUrl.split("/").pop() ?? "resume";
    a.click();
    URL.revokeObjectURL(url);
  } catch { onError("Download failed. Please try again."); }
}
