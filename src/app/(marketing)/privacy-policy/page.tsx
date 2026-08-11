"use client";

import { LegalPage } from "@/components/sections/marketing/legal-page";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="How Vireo collects, uses, and protects the personal information of our users."
      effectiveDate="August 1, 2026"
      intro={"This Privacy Policy describes how Vireo Pro Systems Inc. (\"Vireo\", \"we\", \"our\") collects, uses, and shares information about you when you use our website, services, and products (collectively, the \"Services\"). By using the Services you agree to the practices described here."}
      sections={[
        {
          title: "1. Information we collect",
          body: [
            "Account information: your name, email address, and authentication provider details when you create an account or sign in with OAuth.",
            "Workspace content: issues, comments, attachments, boards, and settings that you and your team create within a workspace. We process this content to provide the Services, not to sell it or use it for advertising.",
            "Usage information: log data, device identifiers, feature usage patterns, and diagnostic information used to secure and improve the Services.",
          ],
        },
        {
          title: "2. How we use information",
          body: [
            "We use account information to authenticate you and manage your subscription. We use workspace content to deliver the features you request — for example, rendering boards, running reports, and powering AI assistance.",
            "We use aggregated, de-identified usage data to improve performance and reliability. We never train models on your workspace content for third-party purposes.",
          ],
        },
        {
          title: "3. How we share information",
          body: [
            "We do not sell your personal information or workspace content. We share information only with service providers that help us operate the Services (hosting, storage, transactional email), strictly bound by confidentiality and data-processing agreements.",
            "We may disclose information where required by law or to protect the rights and safety of Vireo, our users, or the public.",
          ],
        },
        {
          title: "4. Data retention",
          body: [
            "We retain account information for as long as your account is active. Workspace content is kept until deletion or account closure, after which it is removed within 30 days.",
            "You can export your data at any time through the API or by contacting support. Backups are held for a further 30 days and then purged.",
          ],
        },
        {
          title: "5. Your rights",
          body: [
            "Depending on your location (including under GDPR and CCPA), you may have the right to access, correct, delete, or port your personal data, and to object to or restrict certain processing.",
            "You can exercise these rights by emailing privacy@vireo.app or opening a support request. We respond within 30 days.",
          ],
        },
        {
          title: "6. Security",
          body: [
            "We use encryption in transit (TLS) and at rest (AES-256). Access to production data is restricted to authorised personnel with least-privilege controls and full audit logging.",
            "Despite these measures, no method of transmission over the internet is 100% secure. We encourage you to enable two-factor authentication where available.",
          ],
        },
        {
          title: "7. Changes to this policy",
          body: [
            "We may update this policy from time to time. Material changes will be announced in-app or by email at least 30 days before they take effect.",
          ],
        },
        {
          title: "8. Contact",
          body: [
            "Questions about this policy can be directed to privacy@vireo.app, or by mail to Vireo Pro Systems Inc., Herengracht 182, Amsterdam, Netherlands.",
          ],
        },
      ]}
    />
  );
}