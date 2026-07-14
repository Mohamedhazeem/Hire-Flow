import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";

type TestRow = { id: string; name: string };
const columns: ColumnDef<TestRow>[] = [
  { key: "name", header: "Name", cell: (row) => row.name },
];

const data: TestRow[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
];

describe("DataTable", () => {
  it("renders empty state when data is empty", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="No results found."
      />,
    );
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("renders column headers and row data", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("selects row when clicking on a row", () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        enableSelection
        selectedIds={new Set()}
        onSelectionChange={onSelectionChange}
        getRowId={(row) => row.id}
      />,
    );

    fireEvent.click(screen.getByText("Alice").closest("tr")!);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const newSet = onSelectionChange.mock.calls[0][0] as Set<string>;
    expect(newSet.has("1")).toBe(true);
  });

  it("selects all rows when clicking each row", () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <DataTable
        columns={columns}
        data={data}
        enableSelection
        selectedIds={new Set()}
        onSelectionChange={onSelectionChange}
        getRowId={(row) => row.id}
      />,
    );

    fireEvent.click(screen.getByText("Alice").closest("tr")!);
    const afterFirst = onSelectionChange.mock.calls[0][0] as Set<string>;

    rerender(
      <DataTable
        columns={columns}
        data={data}
        enableSelection
        selectedIds={afterFirst}
        onSelectionChange={onSelectionChange}
        getRowId={(row) => row.id}
      />,
    );

    fireEvent.click(screen.getByText("Bob").closest("tr")!);
    const afterSecond = onSelectionChange.mock.calls[1][0] as Set<string>;

    rerender(
      <DataTable
        columns={columns}
        data={data}
        enableSelection
        selectedIds={afterSecond}
        onSelectionChange={onSelectionChange}
        getRowId={(row) => row.id}
      />,
    );

    fireEvent.click(screen.getByText("Charlie").closest("tr")!);
    const afterThird = onSelectionChange.mock.calls[2][0] as Set<string>;

    expect(afterThird.has("1")).toBe(true);
    expect(afterThird.has("2")).toBe(true);
    expect(afterThird.has("3")).toBe(true);
  });

  it("disabled row is not selected when clicked", () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        enableSelection
        selectedIds={new Set()}
        onSelectionChange={onSelectionChange}
        getRowId={(row) => row.id}
        disabledIds={new Set(["2"])}
      />,
    );

    fireEvent.click(screen.getByText("Bob").closest("tr")!);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("disabled row checkbox has aria-disabled", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        enableSelection
        selectedIds={new Set()}
        onSelectionChange={vi.fn()}
        getRowId={(row) => row.id}
        disabledIds={new Set(["2"])}
      />,
    );

    const rowCheckboxes = screen
      .getAllByRole("checkbox")
      .filter((cb) => cb.getAttribute("aria-label") === "Select row");
    const bobCheckbox = rowCheckboxes.find(
      (cb) => cb.closest("tr")?.textContent?.includes("Bob"),
    );
    expect(bobCheckbox).toHaveAttribute("aria-disabled", "true");
  });

  it("deselects row when clicking already selected row", () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        enableSelection
        selectedIds={new Set(["1"])}
        onSelectionChange={onSelectionChange}
        getRowId={(row) => row.id}
      />,
    );

    fireEvent.click(screen.getByText("Alice").closest("tr")!);
    const newSet = onSelectionChange.mock.calls[0][0] as Set<string>;
    expect(newSet.has("1")).toBe(false);
  });
});
