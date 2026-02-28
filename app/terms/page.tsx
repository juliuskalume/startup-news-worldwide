import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "Terms governing use of Startup News Worldwide.",
};

export default function TermsPage(): JSX.Element {
  return (
    <div className="app-page-shell">
      <header className="sticky top-0 z-30 border-b border-border-light bg-background-light/90 backdrop-blur dark:border-[#1d283d] dark:bg-[#081120]/90">
        <div className="app-content-container safe-top-container flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-main dark:text-[#ebf2ff]">
              Terms of Service
            </h1>
            <p className="mt-1 text-sm text-text-muted dark:text-[#8fa8d2]">
              Last updated: February 28, 2026
            </p>
          </div>
          <Link
            href="/"
            className="focus-ring inline-flex items-center justify-center rounded-xl border border-border-light px-3 py-2 text-xs font-semibold text-text-main transition hover:border-primary/40 dark:border-[#2b3953] dark:text-[#e7eefc]"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="app-content-container py-4 lg:py-6">
        <article className="space-y-6 rounded-3xl border border-border-light bg-background-light p-5 shadow-soft dark:border-[#223148] dark:bg-[#10192c]">
          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              By accessing or using Startup News Worldwide, you agree to these Terms of Service.
              If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              2. Eligibility and Accounts
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              <li>You must be legally able to use this service in your jurisdiction.</li>
              <li>You are responsible for keeping your login credentials secure.</li>
              <li>
                You are responsible for activity that occurs under your account, except where
                prohibited by law.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              3. Service Description
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              The service aggregates publicly available headlines and excerpts from RSS and
              related sources, and links to original publisher pages. We do not claim ownership
              of third-party content.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              4. Permitted Use
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              You receive a limited, revocable, non-exclusive right to use the app for personal,
              lawful, non-commercial use unless otherwise authorized in writing.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              5. Prohibited Conduct
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              <li>Do not violate laws, regulations, or third-party rights.</li>
              <li>Do not attempt unauthorized access to systems or accounts.</li>
              <li>Do not interfere with service availability, integrity, or security.</li>
              <li>
                Do not scrape, crawl, or automate requests in a way that causes abuse or
                excessive load.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              6. Third-Party Content and Links
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              Articles, headlines, and links may lead to third-party websites and services. We
              are not responsible for third-party content, availability, or practices.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              7. Service Availability and Changes
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              We may modify, suspend, or discontinue features at any time, including feed
              sources and account functions, with or without notice where legally permitted.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              8. Disclaimers
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not warrant
              uninterrupted operation, completeness, or accuracy of content from third-party
              sources.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              9. Limitation of Liability
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              To the maximum extent permitted by law, we are not liable for indirect,
              incidental, special, consequential, or punitive damages, or loss of data, revenue,
              or profits arising from use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              10. Suspension and Termination
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              We may suspend or terminate access if these terms are violated, if required by law,
              or to protect users, systems, and infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              11. Changes to Terms
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              We may update these terms. Continued use after updates take effect means you
              accept the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              12. Contact
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              For legal notices or terms-related questions, contact{" "}
              <a
                href="mailto:sentira.official@gmail.com"
                className="focus-ring rounded-sm font-semibold text-primary"
              >
                sentira.official@gmail.com
              </a>
              .
            </p>
          </section>

          <div className="rounded-2xl border border-border-light bg-background-subtle px-4 py-3 text-xs text-text-muted dark:border-[#2a3954] dark:bg-[#0d1728] dark:text-[#8ea6cf]">
            See the{" "}
            <Link href="/privacy" className="focus-ring rounded-sm font-semibold text-primary">
              Privacy Policy
            </Link>{" "}
            to understand data collection, processing, and user rights.
          </div>
        </article>
      </main>
    </div>
  );
}
