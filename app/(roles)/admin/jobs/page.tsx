import { PageHeader } from "@/components/layout/page-header";
import { AdminJobsTable } from "@/app/features/admin/components/admin-jobs-table";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Jobs",
  description: "View, filter, and manage all job listings on the platform",
};

export default function AdminJobsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Manage all job listings — toggle active/inactive status or delete listings"
      />
      <Suspense fallback={<div className="text-text-muted text-sm py-8 text-center">Loading jobs...</div>}>
        <AdminJobsTable />
      </Suspense>
    </div>
  );
}
