import { verifyRecruiterApplicantRelationship } from "@/app/features/recruiter/libs/verify-recruiter-applicant-relationship";
import { createThreadIdMessageHandlers } from "@/lib/handlers/messages";

export const { GET, POST, DELETE } = createThreadIdMessageHandlers({
  allowedRoles: ["recruiter", "user"],
  verifyRelation: verifyRecruiterApplicantRelationship,
});
