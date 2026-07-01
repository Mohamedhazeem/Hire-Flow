import { prisma } from "@/lib/prisma";

export type FeaturedCompanyRow = {
  id: string;
  name: string;
  logoUrl: string | null;
  industry: string | null;
  _count: { jobs: number };
};

export async function listFeaturedCompanies(limit = 6): Promise<FeaturedCompanyRow[]> {
  const companies = await prisma.company.findMany({
    where: {
      jobs: {
        some: {
          status: "active",
          isActive: true,
        },
      },
    },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      industry: true,
      _count: {
        select: { jobs: true },
      },
    },
    orderBy: {
      jobs: {
        _count: "desc",
      },
    },
    take: limit,
  });

  return companies;
}
