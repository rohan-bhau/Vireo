"use client";

import { LegalPage } from "@/components/sections/marketing/legal-page";

export default function GdprPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="GDPR & Data Protection"
      subtitle="Our commitment to the GDPR, your data subject rights, and how we act as a data processor."
      effectiveDate="August 1, 2026"
      intro="Vireo processes personal data of individuals located in the European Economic Area (EEA), the United Kingdom, and Switzerland. This page explains our role under the GDPR, the data we process, the rights available to you, and how to exercise them."
      sections={[
        {
          title: "1. Roles and responsibilities",
          body: [
            "For workspace content you and your team create, you (or your organisation) are the data controller and Vireo is the data processor. For account data such as your login email, Vireo is the data controller.",
            "When you sign up directly, a Legal Basis of performance of contract or legitimate interest applies. Workspace member data is processed under instructions from the workspace controller.",
          ],
        },
        {
          title: "2. Legal bases",
          body: [
            "We process account data to perform the contract (Art. 6(1)(b)) — providing the account and subscription. We process usage/diagnostic data under legitimate interest (Art. 6(1)(f)) to keep the Services secure and reliable.",
            "Consent-based processing, such as marketing communications, can be withdrawn at any time via the unsubscribe link or support.",
          ],
        },
        {
          title: "3. International transfers",
          body: [
            "Data may be processed in the region you select (EU or US). Transfers from the EEA to the US are governed by standard contractual clauses (SCCs), with supplementary safeguards including encryption and strict access controls.",
          ],
        },
        {
          title: "4. Data subject rights",
          body: [
            "You have the right to access, rectify, and erase personal data; to restrict or object to processing; to data portability; and where processing is consent-based, to withdraw consent.",
            "For workspace content, the workspace controller is best placed to act on your request first. You may also contact us directly at privacy@vireo.app — we respond within 30 days.",
          ],
        },
        {
          title: "5. Data processing agreements (DPA)",
          body: [
            "A signed DPA with EU and UK standard contractual clauses is available to all customers on paid plans. Enterprise customers receive a fully executed document, including sub-processor list with notice periods.",
            "Our sub-processors (hosting, storage, transactional email) all meet GDPR obligations and are covered by our DPA.",
          ],
        },
        {
          title: "6. Retention and erasure",
          body: [
            "Workspace data is retained for the life of the workspace and removed within 30 days of deletion or workspace closure. Backups are purged within a further 30 days.",
            "Exercise your right to erasure by emailing privacy@vireo.app; we will confirm deletion of all associated personal data.",
          ],
        },
        {
          title: "7. Security measures",
          body: [
            "We implement appropriate technical and organisational measures: encryption in transit and at rest, least-privilege access controls, mandatory security training, penetration testing, and full audit logging.",
            "In the event of a personal data breach we notify controllers without undue delay and the relevant supervisory authority where required by law.",
          ],
        },
        {
          title: "8. Supervisory authority",
          body: [
            "If you believe processing infringes the GDPR, you may lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens) or the data protection authority of your member state.",
          ],
        },
      ]}
    />
  );
}