import Link from "next/link";
import { listFeaturedCompanies } from "../../public/queries/list-featured-companies";
import { CompanyPreviewCard } from "@/components/shared/company-preview-card";
import { Building2Icon } from "lucide-react";

export async function FeaturedCompanies() {
  const companies = await listFeaturedCompanies(6);

  return (
    <section className="py-12 sm:py-16 text-slate-950 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-brand-light mb-3">
            Featured talent networks
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold">Companies hiring exceptional people</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Quickly view the leading organizations actively sourcing candidates on HireFlow.
          </p>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-12 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <Building2Icon className="size-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-300">No featured companies yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Companies will appear here when they start hiring.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
