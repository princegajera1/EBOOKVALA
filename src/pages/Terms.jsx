import React from "react";
import { LegalLayout } from "../components/ui/LegalLayout";

export const Terms = () => {
  const toc = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "license", title: "2. Intellectual Property" },
    { id: "accounts", title: "3. User Conduct & Accounts" },
    { id: "disclaimer", title: "4. Disclaimers & Warranties" },
    { id: "liability", title: "5. Limitation of Liability" },
    { id: "governing", title: "6. Governing Law" },
    { id: "modifications", title: "7. Modifications" },
    { id: "dmca", title: "8. DMCA Takedown Policy" },
    { id: "refund", title: "9. Refund & Purchase Policy" },
    { id: "copyright", title: "10. Copyright Notice" }
  ];

  return (
    <LegalLayout 
      title="Terms of Service" 
      lastUpdated="July 4, 2026" 
      toc={toc}
    >
      <section id="acceptance">
        <h2 className="text-base font-bold text-brand-text mb-3">1. Acceptance of Terms</h2>
        <div className="space-y-3 font-normal">
          <p>
            Welcome to EBOOKVALA. By accessing, reading, downloading, or using our digital library resources and tools, you agree to be bound by these Terms of Service. If you do not accept these terms, you must cease all usage immediately.
          </p>
          <p className="border-l-2 border-brand-accent/50 pl-3.5 py-1 text-xs italic bg-brand-bg-secondary/40 font-mono">
            [INSERT LEGAL TERMS — TO BE REVIEWED BY LEGAL COUNSEL]
          </p>
          <p>
            These terms constitute a binding legal agreement between you ("User" or "you") and EBOOKVALA ("we", "us", or "our").
          </p>
        </div>
      </section>

      <section id="license">
        <h2 className="text-base font-bold text-brand-text mb-3">2. Intellectual Property & Digital Rights</h2>
        <div className="space-y-3 font-normal">
          <p>
            All digital book contents, cover art, outlines, study guides, and visual mind maps available on EBOOKVALA are either the intellectual property of their respective authors, shared under appropriate open licenses, or public domain materials.
          </p>
          <p>
            We grant you a personal, non-exclusive, non-transferable, revocable license to access, view, and download digital copies of cataloged files for your personal, non-commercial educational reading. You may not distribute, re-sell, bundle, or commercialize any material downloaded from this platform without explicit written authorization from the copyright holder.
          </p>
          <p className="border-l-2 border-brand-accent/50 pl-3.5 py-1 text-xs italic bg-brand-bg-secondary/40 font-mono">
            [INSERT LEGAL TERMS — TO BE REVIEWED BY LEGAL COUNSEL]
          </p>
        </div>
      </section>

      <section id="accounts">
        <h2 className="text-base font-bold text-brand-text mb-3">3. User Conduct & Accounts</h2>
        <div className="space-y-3 font-normal">
          <p>
            Certain features of our platform, such as adding books to your personal library, taking outlines, and utilizing the inline AI Study Tutor, require registration. You are responsible for maintaining the confidentiality of your credentials and verifications.
          </p>
          <p>
            You agree to use EBOOKVALA in compliance with all local laws and respect author contributions. Spamming comments, sharing abusive reviews, or attempting to scrape book data in bulk is strictly prohibited.
          </p>
        </div>
      </section>

      <section id="disclaimer">
        <h2 className="text-base font-bold text-brand-text mb-3">4. Disclaimers & Warranties</h2>
        <div className="space-y-3 font-normal">
          <p>
            The services, books, summaries, and AI outlines provided on EBOOKVALA are supplied "as is" and "as available". We do not guarantee that the library platform will be uninterrupted, error-free, or secure.
          </p>
          <p>
            Any advice, strategy, code syntax, or recommendation contained in ebooks listed on EBOOKVALA is the sole opinion of its respective author. EBOOKVALA holds no liability for implementations of knowledge read on this site.
          </p>
          <p className="border-l-2 border-brand-accent/50 pl-3.5 py-1 text-xs italic bg-brand-bg-secondary/40 font-mono">
            [INSERT LEGAL TERMS — TO BE REVIEWED BY LEGAL COUNSEL]
          </p>
        </div>
      </section>

      <section id="liability">
        <h2 className="text-base font-bold text-brand-text mb-3">5. Limitation of Liability</h2>
        <div className="space-y-3 font-normal">
          <p>
            To the maximum extent permitted by applicable law, EBOOKVALA shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of or inability to use the library service, books, outlines, or downloads.
          </p>
        </div>
      </section>

      <section id="governing">
        <h2 className="text-base font-bold text-brand-text mb-3">6. Governing Law & Jurisdiction</h2>
        <div className="space-y-3 font-normal">
          <p>
            These Terms of Service shall be governed by and interpreted in accordance with the laws of India, without reference to its conflict of law principles. Any dispute arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in Ahmedabad, Gujarat, India.
          </p>
        </div>
      </section>

      <section id="modifications">
        <h2 className="text-base font-bold text-brand-text mb-3">7. Modifications to Agreement</h2>
        <div className="space-y-3 font-normal">
          <p>
            We reserve the right to modify or replace these Terms of Service at any time. We will post notification of changes by updating the "Last Updated" date at the top of this document. Continued use of the platform following updates represents agreement to the amended terms.
          </p>
        </div>
      </section>

      <section id="dmca">
        <h2 className="text-base font-bold text-brand-text mb-3">8. DMCA Takedown & Copyright Infringement Policy</h2>
        <div className="space-y-3 font-normal">
          <p>
            EBOOKVALA respects the intellectual property rights of authors, creators, and publishers. If you believe your copyrighted work has been reproduced or distributed on our platform without authorization, please submit a formal DMCA Takedown Notice to copyright@ebookvala.com.
          </p>
          <p>
            Your notice must include: (a) physical or electronic signature of the copyright owner, (b) identification of the copyrighted work claimed to have been infringed, (c) URL link or exact location of the infringing material on EBOOKVALA, (d) your full name, physical address, phone number, and email, and (e) a statement that you have a good-faith belief that the use is unauthorized.
          </p>
        </div>
      </section>

      <section id="refund">
        <h2 className="text-base font-bold text-brand-text mb-3">9. Refund & Digital Content License Policy</h2>
        <div className="space-y-3 font-normal">
          <p>
            EBOOKVALA offers open-access reading and premium digital downloads. Digital book purchases and subscription upgrades grant immediate access to non-returnable digital content.
          </p>
          <p>
            If you encounter technical issues accessing a purchased eBook, or if a transaction was processed in error, you may request a full refund within 7 days of purchase by contacting support@ebookvala.com. Approved refunds will be credited back to your original payment method within 5–7 business days.
          </p>
        </div>
      </section>

      <section id="copyright">
        <h2 className="text-base font-bold text-brand-text mb-3">10. Copyright Notice & Ownership</h2>
        <div className="space-y-3 font-normal">
          <p>
            © 2026 EBOOKVALA. All rights reserved. All trademarks, service marks, logos, brand names, and registered titles displayed on this site are the property of their respective owners and used strictly for cataloging and educational identification.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
};

export default Terms;
