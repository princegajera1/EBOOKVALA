import React from "react";
import { LegalLayout } from "../components/ui/LegalLayout";

export const Privacy = () => {
  const toc = [
    { id: "collect", title: "1. Data We Collect" },
    { id: "use", title: "2. How We Use It" },
    { id: "cookies", title: "3. Cookies & Analytics" },
    { id: "sharing", title: "4. Third-Party Sharing" },
    { id: "rights", title: "5. Your Rights" },
    { id: "contact", title: "6. Privacy Contact" }
  ];

  return (
    <LegalLayout 
      title="Privacy Policy" 
      lastUpdated="July 4, 2026" 
      toc={toc}
    >
      <section id="collect">
        <h2 className="text-base font-bold text-brand-text mb-3">1. Information We Collect</h2>
        <div className="space-y-3 font-normal">
          <p>
            At EBOOKVALA, we believe in minimizing user tracking. We collect information necessary to deliver library services:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Credentials:</strong> Display name, email address, and authentication data (via email verification/tokens).</li>
            <li><strong>Library Preferences:</strong> Books added to your digital shelves, highlights, bookmark marks, and custom outlines.</li>
            <li><strong>Technical Diagnostics:</strong> IP address, device viewport sizing, browser type, and page interaction metrics.</li>
          </ul>
          <p className="border-l-2 border-brand-accent/50 pl-3.5 py-1 text-xs italic bg-brand-bg-secondary/40 font-mono">
            [INSERT PRIVACY POLICY — TO BE REVIEWED BY LEGAL COUNSEL]
          </p>
        </div>
      </section>

      <section id="use">
        <h2 className="text-base font-bold text-brand-text mb-3">2. How We Use Your Data</h2>
        <div className="space-y-3 font-normal">
          <p>
            Your data is strictly utilized to run the learning platform. We do not sell your personal files or search queries to data networks.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Syncing your digital library across your phone, tablet, and computer.</li>
            <li>Processing in-reader AI prompts and outlines using local models or API tokens.</li>
            <li>Providing authors with aggregated, anonymous download count statistics (no individual reader names are exposed).</li>
            <li>Preventing spam and secure account access logs.</li>
          </ul>
        </div>
      </section>

      <section id="cookies">
        <h2 className="text-base font-bold text-brand-text mb-3">3. Cookies & Local Storage</h2>
        <div className="space-y-3 font-normal">
          <p>
            We use functional cookies and local storage tokens to persist your theme choice (Sepia/Dark Mode/Light Mode), retain your active session tokens so you don't need to log in repeatedly, and manage recent search histories.
          </p>
          <p className="border-l-2 border-brand-accent/50 pl-3.5 py-1 text-xs italic bg-brand-bg-secondary/40 font-mono">
            [INSERT PRIVACY POLICY — TO BE REVIEWED BY LEGAL COUNSEL]
          </p>
        </div>
      </section>

      <section id="sharing">
        <h2 className="text-base font-bold text-brand-text mb-3">4. Third-Party Sharing</h2>
        <div className="space-y-3 font-normal">
          <p>
            We only share data with essential infrastructure systems (such as database host systems, authentication modules, or AI prompt gateways). We enforce strict security checks to guarantee third parties cannot use your personal identifiers for target advertising.
          </p>
        </div>
      </section>

      <section id="rights">
        <h2 className="text-base font-bold text-brand-text mb-3">5. Your Rights</h2>
        <div className="space-y-3 font-normal">
          <p>
            You hold absolute rights over your reading history. At any time, you can request to edit your profile information, download a JSON file containing all your book bookmarks and highlights, or request the deletion of your account.
          </p>
          <p>
            If you wish to purge your account history, contact our support team.
          </p>
        </div>
      </section>

      <section id="contact">
        <h2 className="text-base font-bold text-brand-text mb-3">6. Privacy Contact</h2>
        <div className="space-y-3 font-normal">
          <p>
            If you have questions regarding EBOOKVALA's privacy policy, security verifications, or how cookies are managed, please reach out to us at:
          </p>
          <p className="font-semibold text-brand-text">
            Email: privacy@ebookvala.com
          </p>
          <p className="border-l-2 border-brand-accent/50 pl-3.5 py-1 text-xs italic bg-brand-bg-secondary/40 font-mono">
            [INSERT PRIVACY POLICY — TO BE REVIEWED BY LEGAL COUNSEL]
          </p>
        </div>
      </section>
    </LegalLayout>
  );
};

export default Privacy;
