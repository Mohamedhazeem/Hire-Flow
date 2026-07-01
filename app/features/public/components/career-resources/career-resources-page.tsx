import { ResourceHero } from "./resource-hero";
import { ResumeTipsSection } from "./resume-tips-section";
import { InterviewChecklistSection } from "./interview-checklist-section";
import { SalaryFAQSection } from "./salary-faq-section";
import { ResourcesCTA } from "./resources-cta";

export function CareerResourcesPage() {
  return (
    <>
      <ResourceHero />
      <ResumeTipsSection />
      <InterviewChecklistSection />
      <SalaryFAQSection />
      <ResourcesCTA />
    </>
  );
}
