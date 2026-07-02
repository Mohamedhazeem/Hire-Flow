# Hire Flow — Requirements Specification

## Overview

Hire Flow is a multi-role job marketplace and applicant tracking system. It serves four distinct user roles — users (job seekers), recruiters (employers), admins (platform operators), and super admins — with role-specific dashboards, workflows, and permissions.

## Roles

| Role | Description | Landing Page |
|---|---|---|
| `user` | Job seeker who browses, applies, and manages applications | /jobs (public marketplace) |
| `recruiter` | Employer who posts jobs, manages applicants, and communicates | /recruiter (dashboard) |
| `admin` | Platform operator with oversight over all users, jobs, and messages | /admin (dashboard) |
| `super_admin` | Elevated admin with admin team management privileges | /admin (dashboard) |

---

## Phase 0: Foundation

### 0.1 Project Initialisation

The project is scaffolded as a Next.js 16 App Router application with TypeScript strict mode, Tailwind v4, Shadcn UI, Prisma + PostgreSQL, and Better Auth.

### 0.2 Database Schema

A Prisma schema defines the complete data model including authentication tables (User, Session, Account, Verification), platform models (UserProfile, Resume, Company, Job, Application), messaging (Message), notifications (Notification), and administrative models (AdminInvite, RecruiterInvite).

**Acceptance Criteria:**
- Schema compiles and generates Prisma client successfully
- All relationships and constraints enforce data integrity
- Migration can be applied to a PostgreSQL database

### 0.3 Middleware & Route Guards

The proxy middleware (`proxy.ts`) enforces:
- Authenticated users are redirected away from auth pages
- Unauthenticated users are redirected to login from protected routes
- Non-admin users cannot access admin routes

**Acceptance Criteria:**
- Route protection works for all role-based paths
- Redirect preserves return URL path where appropriate
- Auth pages are inaccessible to logged-in users

### 0.4 Shared UI Primitives

A library of Shadcn-based UI components (Button, Input, Badge, Table, Select, Popover, Dialog, etc.) provides consistent styling across all role interfaces.

**Acceptance Criteria:**
- All UI components follow design system conventions
- Components work across light, dark, and system theme modes

### 0.5 File Upload Infrastructure

A file upload API endpoint handles resume file uploads. The current implementation uses a mock provider for development.

**Acceptance Criteria:**
- Files can be uploaded via multipart form data
- File metadata is persisted to the database

### 0.6 Database Seed Script

A seed script populates the database with test data including users of all roles, companies, jobs, and sample applications.

**Acceptance Criteria:**
- Seed script runs without errors
- Test data reflects realistic scenarios for all roles

### 0.7 State Management Infrastructure

TanStack Query provider wraps the root layout for server-state management. Zustand stores handle client-state (UI toggles, theme).

**Acceptance Criteria:**
- Query client is available to all client components
- Zustand stores persist sidebar state and theme preference

---

## Phase 1: Admin

### 1.1 Admin API

Admin users can query the full user list with pagination, filtering, and sorting. They can view individual user details, ban/unban users, revoke sessions, and change user roles.

**User Stories:**
- As an Admin, I want to view all platform users and filter by role, ban status, and search terms
- As an Admin, I want to ban malicious users, which revokes all their active sessions
- As an Admin, I want to unban users when a ban period expires
- As an Admin, I want to promote users to recruiter or demote recruiters
- As an Admin, I want to view a user's active sessions and revoke them if needed

**Business Rules:**
- Banning a user sets `banned = true`, stores a `banReason`, and sets `banExpiresAt` (nullable for permanent bans)
- Banning automatically revokes all active sessions for that user
- Super admins cannot be banned or have their role changed by regular admins

### 1.2 Admin UI

Admin users have a dedicated dashboard with sections for managing users and recruiters.

**User Stories:**
- As an Admin, I want a data table of all users with search, filter, sort, and pagination
- As an Admin, I want to view detailed user profiles including their applications
- As an Admin, I want a data table of all recruiters with their company affiliations

**Acceptance Criteria:**
- User table supports search by name/email, filter by role/ban status, sort by any column
- Clicking a user opens their profile view with application history
- Recruiter table shows company name alongside recruiter details

### 1.3 Admin Team Management

Admins can invite other admins to the platform team, view pending invites, cancel invites, and remove team members.

**User Stories:**
- As an Admin, I want to invite new admins via email with a time-limited token
- As an Admin, I want to view all pending invites and cancel them
- As an Admin, I want to remove admin team members
- As an invitee, I want to accept the invite and gain admin access

**Business Rules:**
- Only super admins can manage the admin team
- Invite tokens are single-use and time-limited
- An admin cannot remove themselves

### 1.4 Job Oversight & Analytics

Admins can view all jobs across all companies, toggle job active status (kill-switch), and view platform-wide analytics.

**User Stories:**
- As an Admin, I want to see all jobs across all companies with filtering by status, company, and date
- As an Admin, I want to deactivate any job to remove it from public view
- As an Admin, I want a dashboard with platform statistics (total users, jobs, applications, companies)

**Business Rules:**
- `isActive: false` removes a job from all public listings regardless of recruiter-set `status`
- Dashboard aggregates are computed server-side from live database counts

### 1.5 Admin Messaging (REST)

Admins can search for users/recruiters and initiate message threads.

**User Stories:**
- As an Admin, I want to search for any user or recruiter by name or email
- As an Admin, I want to start a conversation thread with any user

### 1.6 Admin Messaging (Real-time)

Admin messages are delivered in real-time via Pusher with thread-based channels. The notification bell shows unread message counts.

**User Stories:**
- As an Admin, I want to see new messages appear without manual refresh
- As an Admin, I want a notification badge showing unread message count

**Acceptance Criteria:**
- Messages are delivered on `private-thread-{id}` channels
- Notification dropdown updates in real-time
- Thread list updates when new messages arrive

### Admin Applicant Detail View

Admins can view applicant details for any application in the system, including profile information, resume, application timeline, and message history.

**User Stories:**
- As an Admin, I want to view any applicant's full detail view (read-only)
- As an Admin, I want to see the applicant's resume snapshot and download it
- As an Admin, I want to see the application's status timeline and message history

---

## Phase 2: Recruiter

### 2.0 Recruiter Layout & Sidebar

Recruiters have a dedicated dashboard layout with navigation sidebar providing access to all recruiter features.

**Acceptance Criteria:**
- Sidebar shows links to Dashboard, Company, Team, Jobs, Applicants, Messages, Notifications, Analytics
- Active route is highlighted
- Notification badge shows unread count on the sidebar link

### 2.1 Company Profile CRUD

Each recruiter manages a single company profile. This profile is visible to job seekers on job listings.

**User Stories:**
- As a Recruiter, I want to create and edit my company profile (name, logo, website, description, industry, social links)
- As a Recruiter, my company profile must be set up before I can post jobs

**Business Rules:**
- One company per recruiter (ownership)
- Company must exist before jobs can be created

### 2.2 Recruiter Team Management

Recruiters can invite team members to manage jobs and applicants under the same company.

**User Stories:**
- As a Recruiter, I want to invite team members via email
- As a Recruiter, I want to bulk-invite multiple team members
- As a Recruiter, I want to view my team and remove members
- As an invitee, I want to accept an invite and join the company as a recruiter

**Business Rules:**
- Invited members gain recruiter role with access to the company's data
- Team members can manage jobs and applicants but cannot modify company profile or team

### 2.3 Job Posts CRUD

Recruiters can create, read, update, delete, and toggle job postings.

**User Stories:**
- As a Recruiter, I want to create job postings with title, description, locations, work mode, employment type, skills, salary range, and application deadline
- As a Recruiter, I want to edit job postings
- As a Recruiter, I want to toggle job status between draft, active, and archived
- As a Recruiter, I want to soft-delete jobs (archived) or permanently delete draft jobs
- As a Recruiter, I want to view all my company's jobs with search, filter, and pagination

**Business Rules:**
- Jobs are tenant-isolated by `companyId`
- Toggle flow: draft → active → archived (no direct draft → archived)
- Active jobs appear in public listings (if `isActive: true`)
- Deleting an active/archived job soft-deletes it; draft jobs are hard-deleted

### 2.4 Applicants View & Status Updates

Recruiters can view applicants for each job, manage a 7-stage hiring pipeline, and use URL-driven pagination.

**User Stories:**
- As a Recruiter, I want to see all applicants for a job with their current status, profile summary, and application date
- As a Recruiter, I want to move applicants through pipeline stages (applied, reviewing, interview, offer, hired, rejected, withdrawn)
- As a Recruiter, I want to see a detailed view of each applicant
- As a Recruiter, I want to revert a status change using the audit trail

**Business Rules:**
- Status transitions are validated against a defined state machine
- Every transition creates an `ApplicationStatusChange` audit row
- Revert uses the audit trail to restore the previous status
- Optimistic concurrency control prevents conflicting status updates
- Applicants and recruiters receive in-app notifications on status changes

### 2.5 Recruiter Direct Messaging

Recruiters can message applicants within thread-based conversations.

**User Stories:**
- As a Recruiter, I want to send messages to applicants who have applied to my company's jobs
- As a Recruiter, I want to see message threads grouped by applicant
- As a Recruiter, I want to receive real-time message updates
- As a Recruiter, I want to attach files to messages

**Business Rules:**
- Recruiters can only message applicants of their own company's jobs
- Rate limit: 20 messages per hour per recruiter-applicant pair
- Messages are delivered in real-time via Pusher
- Users have a reply page to respond to recruiter messages

### 2.6 Applicant Detail View

Recruiters can view comprehensive applicant profiles including timeline, resume, messages, and status actions.

**User Stories:**
- As a Recruiter, I want to view an applicant's full profile (headline, bio, skills, experience, social links)
- As a Recruiter, I want to see the submitted resume snapshot with download option
- As a Recruiter, I want to view the full application status timeline
- As a Recruiter, I want to see all message history with the applicant
- As a Recruiter, I want to change the applicant's status from the detail view

**Business Rules:**
- Resume shown is the snapshot frozen at apply time, not the current live resume
- Timeline shows all `ApplicationStatusChange` records in chronological order
- The first timeline entry shows `fromStatus: null` (initial application)

### 2.7 Bulk Actions

Recruiters can select multiple applicants and perform mass status transitions.

**User Stories:**
- As a Recruiter, I want to select multiple applicants via checkboxes
- As a Recruiter, I want to bulk-reject selected applicants with a shared rejection reason
- As a Recruiter, I want to move multiple applicants to the next pipeline stage

**Business Rules:**
- Bulk actions are atomic — all succeed or none do (database transaction)
- Available actions are the intersection of valid transitions across all selected applicants
- Each selected applicant receives a notification
- Applicants whose status was just changed (actionedIds) are excluded from subsequent bulk actions for one interaction

### 2.8 Recruiter Analytics & Filters

Recruiters can view analytics for individual jobs and across all their jobs.

**User Stories:**
- As a Recruiter, I want to see per-job analytics (applications over time, pipeline funnel, source distribution)
- As a Recruiter, I want to see cross-job analytics with date range, status, and type filters
- As a Recruiter, I want a visual pipeline funnel showing applicant distribution across stages
- As a Recruiter, I want trend charts showing application volume over time

**Business Rules:**
- Analytics respect the same date range filters
- Funnel chart uses a fixed pipeline stage ordering
- Chart colors are consistent across all visualizations

### 2.9 Recruiter Dashboard

Recruiters have a dashboard with summary statistics, recent applications, and quick actions.

**User Stories:**
- As a Recruiter, I want to see key metrics (total jobs, active applications, interviews scheduled, offers made)
- As a Recruiter, I want to see the most recent applications in a table
- As a Recruiter, I want quick action cards to post a job, view analytics, or manage applicants
- As a Recruiter without a company, I want a prompt to create one before accessing features

### 2.10 Notifications & Activity Feed

Recruiters receive notifications for application status changes, new messages, and bulk operations via a shared notification system. A standalone activity page provides full notification history.

**User Stories:**
- As a Recruiter, I want to see notification badges on my sidebar for unread notifications
- As a Recruiter, I want a dropdown showing recent notifications
- As a Recruiter, I want a dedicated activity page with infinite-scroll notification history
- As a Recruiter, I want notifications delivered in real-time via Pusher

### 2.11 CSV Export

Recruiters can export applicant data as CSV files, respecting active filters.

**User Stories:**
- As a Recruiter, I want to export filtered applicant lists as CSV
- As a Recruiter, the CSV should include applicant name, email, status, application date, and resume link

**Business Rules:**
- RFC 4180 compliant CSV with BOM for Excel compatibility
- Streaming export via ReadableStream for memory efficiency
- Maximum 50,000 rows per export
- Export respects current active filters

---

## Phase 3: User (Job Seeker)

### 3.0a Infrastructure Audit

A pre-implementation audit verified that Phase 2 infrastructure (layout, messaging, notifications, auth) supports user-role requirements without modification.

### 3.0b Schema Migration

Schema changes added `deletedAt` to Resume (soft-delete support), `resumeSnapshotUrl` and `resumeSnapshotBuilderData` to Application (apply-time snapshot), and `Bookmark` model for saved jobs.

### 3.1 User Profile

Users can create and manage a professional profile with skills, work experience, education, and social links.

**User Stories:**
- As a User, I want to set my headline, bio, and skills (up to 50)
- As a User, I want to add work experiences with company, title, dates, and descriptions (up to 20)
- As a User, I want to add social links (up to 10)
- As a User, I want to set my salary expectations and work mode preference

**Business Rules:**
- Skills are deduplicated on save
- Experience dates must be chronologically valid
- Social links require a platform and URL

### 3.2 Resumes & In-App Builder

Users can upload resume files or create resumes using an in-app structured builder.

**User Stories:**
- As a User, I want to upload PDF, DOC, or DOCX resumes (up to 10MB)
- As a User, I want to build a resume using a structured form (label, summary, education, experience, skills)
- As a User, I want to set one resume as primary
- As a User, I want to soft-delete resumes with a 60-day retention period
- As a User, I want to download my uploaded resume files
- As a User, I cannot have more than 5 active resumes

**Business Rules:**
- File types allowed: PDF, DOC, DOCX
- Maximum file size: 10MB
- Maximum 5 non-deleted resumes per user
- Soft-delete sets `deletedAt` timestamp, preserving the database record
- Setting a primary resume uses a database transaction to ensure only one primary exists

### 3.2a AI-Powered Resume Assistance

Users can request AI-powered suggestions to improve their builder-created resumes.

**User Stories:**
- As a User, I want to get AI suggestions for improving my resume content
- As a User, I want to see an ATS compatibility score
- As a User, I want to apply individual suggestions or copy them to clipboard
- As a User, I want the AI to identify key strengths and improvement areas

**Business Rules:**
- Rate limit: 5 enhancement requests per user per day (enforced via database log)
- Available providers: Anthropic (Claude), OpenAI (GPT-4o), Google (Gemini)
- Provider selection via `AI_PROVIDER` environment variable
- Graceful fallback when no AI key is configured
- AI suggestions are not auto-applied; user must explicitly apply each suggestion

### 3.3 Job Application Flow

Users can apply to jobs by selecting a resume and optionally including a cover letter.

**User Stories:**
- As a User, I want to apply to a job with one of my resumes
- As a User, I want to optionally include a cover letter (up to 5000 characters)
- As a User, I want to be prevented from applying to the same job twice

**Business Rules:**
- Rate limit: 10 applications per minute per user
- Duplicate detection prevents applying to the same job twice
- At apply time, the resume is snapshotted (file URL or builder data) into the Application record
- First `ApplicationStatusChange` row is created with `fromStatus: null, toStatus: "applied"`
- A notification is sent to the company's recruiters

### 3.4 My Applications

Users can view all their job applications with filtering, search, and status tracking.

**User Stories:**
- As a User, I want to see all my applications with company logo, job title, status, and date
- As a User, I want to filter applications by status
- As a User, I want to search applications by job title or company name
- As a User, I want to see application statistics (total, active, interviews, offers)

### 3.5 Application Detail, Withdraw & Message Recruiter

Users can view detailed application information, withdraw applications, and message recruiters.

**User Stories:**
- As a User, I want to see full application details including job info, timeline, and status
- As a User, I want to withdraw my application (only when status is "applied" or "reviewing")
- As a User, I want to see my submitted resume snapshot
- As a User, I want to message the recruiter from the application detail page

**Business Rules:**
- Withdraw only allowed when status is `applied` or `reviewing`
- Withdrawn status cannot be reverted by the user
- Resume displayed is the snapshot, not the current live version
- Messaging uses the same thread-based system as recruiter messaging

### 3.6 Saved / Bookmarked Jobs

Users can bookmark jobs for later reference.

**User Stories:**
- As a User, I want to bookmark jobs from the job listing or detail page
- As a User, I want to view all my bookmarked jobs on a dedicated page
- As a User, I want to remove bookmarks
- As an anonymous visitor, clicking bookmark redirects me to login with return URL preserved

**Business Rules:**
- Bookmark toggle: same action creates or deletes the bookmark
- `@@unique([userId, jobId])` constraint prevents duplicates
- Inactive/expired jobs appear greyed out in saved list but remain removable
- Anonymous users are prompted to log in before bookmarking

---

## Phase 4: Public Job Routes & Home Page

### 4.0 Public Route Group & Shared Shell

A `(public)` route group provides a consistent layout shell (navbar + footer) for all public-facing pages.

**User Stories:**
- As a visitor, I want consistent navigation and footer across all public pages
- As a visitor, I want to access privacy policy and terms of service pages

### 4.1 Public Job Listings

Job seekers (authenticated or anonymous) can browse, search, and filter all active jobs.

**User Stories:**
- As a job seeker, I want to search jobs by keyword (title, description, company name)
- As a job seeker, I want to filter jobs by work mode, employment type, experience level, industry, and company
- As a job seeker, I want paginated results with offset-based navigation

**Business Rules:**
- Dual-gate visibility: `status === "active"` AND `isActive === true`
- Full-text search via Prisma's PostgreSQL full-text search
- Offset pagination with configurable page size (max 100)

### 4.2 Public Job Details & View Tracking

Visitors can view full job details. Authenticated users see an apply button; anonymous users see a login prompt.

**User Stories:**
- As a job seeker, I want to see complete job details (description, requirements, salary, company info)
- As a user, I want to apply directly from the job detail page
- As an anonymous visitor, I want to be prompted to log in before applying

**Business Rules:**
- View count increments with 30-minute deduplication via sessionStorage
- Company preview card shows on every job detail
- Inactive or deleted jobs show an appropriate state

### 4.3 Auth-Aware Navbar, Redirect Logic & Account Popover

The public navbar adapts based on authentication state and user role. Authenticated users see an account popover with role-specific links.

**User Stories:**
- As an authenticated user, I want to see my avatar and account menu in the navbar
- As a user-role user, I want to see links to Profile, My Applications, Saved Jobs, and Messages (no Dashboard link)
- As a recruiter, I want to see a Dashboard link in my account menu
- As an admin, I want to see a Dashboard link in my account menu
- As a logged-in user visiting /login, I want to be redirected to my role's home page
- As a user, I want to land on /jobs after login (the marketplace)

### 4.4 Home Page Composition

The landing page features a hero section, category strip, featured jobs and companies, how-it-works section, testimonials, and employer CTA.

**User Stories:**
- As a visitor, I want to search jobs directly from the home page hero
- As a visitor, I want to browse jobs by category
- As a visitor, I want to see featured jobs and top companies
- As an employer, I want to learn how to post jobs on the platform

**Acceptance Criteria:**
- All sections have staggered motion animations
- Hero has a full-viewport background image with gradient overlay
- Featured jobs show 6 active jobs
- Featured companies show top 6 companies by job count
- Category strip shows Technology, Healthcare, Finance, Marketing, and Remote

### 4.5 Career Resources

A static resources page provides resume tips, interview checklist, and salary FAQs.

**User Stories:**
- As a job seeker, I want to read resume writing tips
- As a job seeker, I want an interview preparation checklist
- As a job seeker, I want to read salary-related FAQs

### 4.6 SEO

Dynamic sitemap, robots.txt, and JSON-LD structured data for job detail pages.

**User Stories:**
- As a search engine, I want a dynamic sitemap including all active jobs
- As a search engine, I want robots.txt directives for indexing rules

**Acceptance Criteria:**
- Sitemap includes static entries (/, /jobs, /resources, /privacy, /terms) and dynamic job entries
- Dynamic job entries filter on dual-gate (status: active AND isActive: true)
- Robots.txt disallows /admin, /recruiter, /user, /api
- JSON-LD JobPosting structured data is generated for job detail pages with null-guarded fields
