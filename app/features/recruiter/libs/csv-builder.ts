const BOM = "\uFEFF";
const CRLF = "\r\n";

export function escapeCsvField(value: string): string {
  if (!value) return '""';
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function buildCsvRow(values: string[]): string {
  return values.map(escapeCsvField).join(",") + CRLF;
}

export function buildCsvString(headers: string[], rows: string[][]): string {
  return BOM + buildCsvRow(headers) + rows.map(buildCsvRow).join("");
}
