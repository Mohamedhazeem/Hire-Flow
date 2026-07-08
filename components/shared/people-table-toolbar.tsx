"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

function capitalizeLabel(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatLabel(value: string): string {
  return capitalizeLabel(value.replace(/_/g, " "));
}

const ROLE_OPTIONS = ["user", "recruiter", "admin"] as const;

type PeopleTableToolbarProps = {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  roleFilter?: string;
  role: string | undefined;
  onRoleFilter: (value: string | null) => void;
  banned: string;
  onBannedFilter: (value: string | null) => void;
};

export function PeopleTableToolbar({
  search,
  onSearchChange,
  roleFilter,
  role,
  onRoleFilter,
  banned,
  onBannedFilter,
}: PeopleTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={onSearchChange}
          className="pl-10 rounded-xl bg-bg-elevated border-border-subtle"
        />
      </div>
      {!roleFilter && (
        <Select value={role ?? "all"} onValueChange={onRoleFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue>{role === undefined ? "All roles" : formatLabel(role)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {formatLabel(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select value={banned} onValueChange={onBannedFilter}>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue>
            {banned === "all" ? "All" : banned === "true" ? "Banned" : "Active"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="true">Banned</SelectItem>
          <SelectItem value="false">Active</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
