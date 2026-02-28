import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How Startup News Worldwide collects, uses, stores, and protects user data.",
};

export default function PrivacyPage(): JSX.Element {
  return (
    <div className="app-page-shell">
      <header className="sticky top-0 z-30 border-b border-border-light bg-background-light/90 backdrop-blur dark:border-[#1d283d] dark:bg-[#081120]/90">
        <div className="app-content-container safe-top-container flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-main dark:text-[#ebf2ff]">
              Privacy Policy
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
              1. Scope
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              This policy applies to Startup News Worldwide on the web and Android app
              wrapper, including services hosted at <strong>news.sentirax.com</strong> and
              package <strong>com.sentirax.news</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              2. Data We Collect
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              <li>
                <strong>Account data:</strong> email address, Firebase user ID, auth provider,
                and email verification status.
              </li>
              <li>
                <strong>Preference data:</strong> saved articles, selected country, theme,
                and reader text size.
              </li>
              <li>
                <strong>Technical data:</strong> request metadata needed to operate and secure
                the service (for example basic logs and error data from hosting and Firebase).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              3. How We Use Data
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              <li>Authenticate users and protect accounts.</li>
              <li>Sync your preferences and saved articles across devices.</li>
              <li>Deliver news feeds, search, and reader functionality.</li>
              <li>Monitor performance, reliability, and abuse prevention.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              4. Legal Bases (EEA/UK)
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              Where applicable, processing is based on contract (providing the service),
              legitimate interests (security and service quality), and consent where required.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              5. Sharing and Third Parties
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              <li>
                <strong>Infrastructure providers:</strong> Firebase (authentication and
                Firestore) and hosting providers used to run the app.
              </li>
              <li>
                <strong>News sources:</strong> the app aggregates headlines from third-party
                RSS publishers; opening source links takes you to their websites.
              </li>
              <li>
                <strong>Legal requirements:</strong> data may be disclosed if required by law
                or to protect rights, safety, and platform security.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              6. Retention
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              <li>Synced preference data is retained while your account remains active.</li>
              <li>Local browser/app storage remains until you clear app/site data.</li>
              <li>
                Operational logs are retained only as long as reasonably needed for
                security and diagnostics.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              7. Your Choices and Rights
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              <li>Update country, theme, and reader settings in-app at any time.</li>
              <li>Remove saved articles directly from the Saved screen.</li>
              <li>Sign out to stop active session use on a device.</li>
              <li>
                Depending on your location, you may request access, correction,
                deletion, or export of your data through official support channels.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              8. Security
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              We use reasonable technical and organizational measures to protect data, but no
              internet service can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              9. Children
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              The service is not directed to children under 13 (or higher age where required by
              local law). Do not use the service if you are not legally permitted to do so.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              10. Policy Updates
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              We may revise this policy from time to time. Material updates will be reflected by
              the &quot;Last updated&quot; date on this page.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              11. Contact
            </h2>
            <p className="mt-2 text-sm leading-7 text-text-muted dark:text-[#8ea6cf]">
              For privacy questions, requests, or complaints, contact{" "}
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
            Review the{" "}
            <Link href="/terms" className="focus-ring rounded-sm font-semibold text-primary">
              Terms of Service
            </Link>{" "}
            for service rules, disclaimers, and limitations.
          </div>
        </article>
      </main>
    </div>
  );
}
