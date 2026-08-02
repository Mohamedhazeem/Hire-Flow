import { CareerResourcesPage } from "@/app/features/public/components/career-resources";

export const metadata = {
  title: "Career Resources",
  description:
    "Resume tips, interview prep, and salary negotiation advice to help you land your next role.",
};

export default function ResourcesPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <CareerResourcesPage />
    </div>
  );
}
