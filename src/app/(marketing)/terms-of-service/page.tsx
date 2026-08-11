"use client";

import { LegalPage } from "@/components/sections/marketing/legal-page";

export default function TermsOfServicePage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="The agreement that governs your use of Vireo's products and services."
      effectiveDate="August 1, 2026"
      intro={"These Terms of Service (\"Terms\") govern your access to and use of the Vireo Services. By creating an account or using the Services, you agree to these Terms. If you are using the Services on behalf of an organisation, you agree to these Terms on that organisation's behalf."}
      sections={[
        {
          title: "1. Accepting the terms",
          body: [
            "You may use the Services only in compliance with these Terms and all applicable laws and regulations. If you do not agree to these Terms, you may not use the Services.",
          ],
        },
        {
          title: "2. Your account",
          body: [
            "You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. You must provide accurate account information and keep it up to date.",
            "You must be at least 16 years old to use the Services. Workspaces may impose their own policies on members.",
          ],
        },
        {
          title: "3. Your content",
          body: [
            "You retain all rights to the content you and your team create in a workspace. You grant Vireo a limited licence to host, store, and process that content solely to provide the Services to you.",
            "You are responsible for the content your team uploads and must have the right to share it. Vireo may remove content that violates these Terms or applicable law.",
          ],
        },
        {
          title: "4. Acceptable use",
          body: [
            "You may not use the Services to transmit malware, phishing attempts, or illegal material; to probe, scan, or test the security of the Services without authorisation; to resell or sublicense access without a written agreement; or to interfere with service availability.",
            "We may suspend access that violates these rules, with notice where practicable.",
          ],
        },
        {
          title: "5. Subscriptions and billing",
          body: [
            "Paid plans renew automatically unless cancelled before the renewal date. Fees are non-refundable except where required by law. You may change or cancel your plan from workspace settings.",
            "We may change pricing prospectively with 30 days' notice, announced in-app or by email.",
          ],
        },
        {
          title: "6. AI features",
          body: [
            "AI-assisted features (estimation, prioritisation, drafting, and summarisation) generate suggestions only and are not a substitute for professional judgement. You are responsible for reviewing and approving AI-generated content before acting on it.",
          ],
        },
        {
          title: "7. Warranty disclaimer",
          body: [
            "The Services are provided \"as is\" and \"as available\" without warranties of any kind, express or implied, including fitness for a particular purpose and non-infringement. We do not guarantee that the Services will be uninterrupted or error-free.",
          ],
        },
        {
          title: "8. Limitation of liability",
          body: [
            "To the maximum extent permitted by law, Vireo's aggregate liability for any claim arising from the Services will not exceed the amount you paid in the twelve months preceding the claim. We are not liable for indirect, incidental, or consequential damages, including lost profits or data.",
          ],
        },
        {
          title: "9. Termination",
          body: [
            "You may close your account at any time. We may suspend or terminate access for breach of these Terms, with notice where practicable. Upon termination, you can export your data for a period of 30 days.",
          ],
        },
        {
          title: "10. Governing law",
          body: [
            "These Terms are governed by the laws of the Netherlands, without regard to conflict-of-law principles. Disputes will be resolved in the competent courts of Amsterdam.",
          ],
        },
      ]}
    />
  );
}