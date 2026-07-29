import BackButton from "./back-button";

export type ErrorPageType = {
  errorTag: string;
  title: string;
  description: string;
  path?: string;
  session?: boolean;
};
export default function ErrorPage({ errorTag, title, description, path, session }: ErrorPageType) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page px-4 py-20 text-text-body">
      <div className="hidden sm:block absolute top-0 left-0 w-72 h-72 bg-brand-light rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="hidden sm:block absolute bottom-0 right-0 w-72 h-72 bg-accent-light rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 rounded-3xl border border-border-subtle bg-bg-surface px-6 sm:px-8 py-12 shadow-lg shadow-brand/10 text-center">
        <span className="inline-flex rounded-full bg-error/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-error">
          {errorTag}
        </span>

        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-text-heading">
            {title}
          </h1>
          <p className="max-w-md text-sm leading-7 text-text-muted">{description}</p>
        </div>
        <BackButton path={path} message={session ? "Go Back to My Dashboard" : "Go Back"} />
      </div>
    </div>
  );
}
