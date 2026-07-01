import Link from "next/link";
import { listFeaturedCompanies } from "../queries/list-featured-companies";
import { CompanyPreviewCard } from "@/components/shared/company-preview-card";
import { Building2Icon } from "lucide-react";

export async function FeaturedCompanies() {
  const companies = await listFeaturedCompanies(6);

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-heading">
            Featured Companies
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Top employers hiring right now
          </p>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border-subtle rounded-xl">
            <Building2Icon className="size-8 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">No featured companies yet</p>
            <p className="text-sm text-text-muted mt-1">Companies will appear here when they start hiring</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c) => (
              <Link key={c.id} href={`/jobs?companyId=${c.id}`} className="block">
                <CompanyPreviewCard
                  name={c.name}
                  logo={c.logoUrl}
                  website={null}
                  description={null}
                  locations={[]}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
