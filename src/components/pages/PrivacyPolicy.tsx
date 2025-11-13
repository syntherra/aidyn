import React from "react";
import styles from "./PrivacyPolicy.module.scss";
import Button from "../ui/Button";

const PrivacyPolicy = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <img src="/assets/Vector.svg" alt="AIDYN logo" className={styles.logo} />
          <h1 className={styles.title}>Privacy Policy</h1>
        </div>
        <p className={styles.updated}>Last Updated: November 13, 2025</p>

        <h2 className={styles.sectionTitle}>Overview</h2>
        <p className={styles.paragraph}>
          AIDYN ("we", "us", "our") is an AI-powered lead generation and CRM platform. This
          Privacy Policy explains how we collect, use, disclose, and protect information when you use
          our websites, applications, and services (collectively, the "Services"). By using the Services
          you agree to the practices described in this Policy.
        </p>

        <h2 className={styles.sectionTitle}>Information We Collect</h2>
        <ul className={styles.list}>
          <li>Account Data: name, email address, password, workspace details.</li>
          <li>Lead & CRM Data: business contacts, emails, engagement events, suppression lists.</li>
          <li>Usage Data: logs, device information, IP address, timestamps, performance metrics.</li>
          <li>Billing Data: payment identifiers managed by trusted processors (e.g., Stripe).</li>
          <li>Third-Party Data: verification/enrichment from providers you authorize.</li>
        </ul>

        <h2 className={styles.sectionTitle}>How We Use Information</h2>
        <ul className={styles.list}>
          <li>Provide, operate, and improve the Services.</li>
          <li>Create and personalize outreach, campaigns, and analytics.</li>
          <li>Maintain CRM accuracy, suppression, and compliance workflows.</li>
          <li>Detect, prevent, and address security, abuse, and technical issues.</li>
          <li>Communicate about updates, support, and service-related notices.</li>
        </ul>

        <h2 className={styles.sectionTitle}>Legal Bases</h2>
        <p className={styles.paragraph}>
          We process personal data under lawful bases including consent, contract performance, legitimate
          interests (e.g., platform improvement and security), and compliance with legal obligations.
        </p>

        <h2 className={styles.sectionTitle}>Sharing & Disclosure</h2>
        <ul className={styles.list}>
          <li>Service providers for hosting, analytics, email, and payments.</li>
          <li>Integrations you enable (e.g., verification, enrichment, email providers).</li>
          <li>Law enforcement or regulators when legally required.</li>
          <li>Business transfers in the event of merger, acquisition, or reorganization.</li>
        </ul>

        <h2 className={styles.sectionTitle}>Data Retention</h2>
        <p className={styles.paragraph}>
          We retain data for as long as necessary to provide the Services and for legitimate business
          purposes. You may request deletion of data associated with your workspace subject to legal and
          contractual limits.
        </p>

        <h2 className={styles.sectionTitle}>International Transfers</h2>
        <p className={styles.paragraph}>
          Data may be processed in jurisdictions outside your country. We implement safeguards consistent
          with applicable laws for cross-border data transfers.
        </p>

        <h2 className={styles.sectionTitle}>Security</h2>
        <p className={styles.paragraph}>
          We use industry-standard security measures including encryption in transit and at rest, role-based
          access controls, auditing, and secret management. No method of transmission is completely secure,
          and we cannot guarantee absolute security.
        </p>

        <h2 className={styles.sectionTitle}>Your Rights</h2>
        <ul className={styles.list}>
          <li>Access, correction, deletion, portability of your personal data.</li>
          <li>Objection or restriction of certain processing.</li>
          <li>Withdrawal of consent where processing is based on consent.</li>
          <li>Right to lodge a complaint with your supervisory authority.</li>
        </ul>

        <h2 className={styles.sectionTitle}>Cookies & Tracking</h2>
        <p className={styles.paragraph}>
          We use cookies and similar technologies for authentication, preferences, performance, and analytics.
          You can manage cookies via your browser settings; some features may not function without them.
        </p>

        <h2 className={styles.sectionTitle}>Children's Privacy</h2>
        <p className={styles.paragraph}>
          The Services are not directed to children under 16. We do not knowingly collect personal data from
          children. If you believe a child has provided data, contact us to remove it.
        </p>

        <h2 className={styles.sectionTitle}>Changes to This Policy</h2>
        <p className={styles.paragraph}>
          We may update this Policy from time to time. Material changes will be notified via the Services
          or by email. Continued use of the Services after changes indicates acceptance.
        </p>

        <h2 className={styles.sectionTitle}>Contact</h2>
        <p className={styles.paragraph}>
          For privacy inquiries, requests, or complaints, contact: privacy@aidyn.app.
        </p>

        <div className={styles.backRow}>
          <a href="#/" className={styles.backLink} aria-label="Back to Sign Up">Back</a>
          <Button variant="neutral" ariaLabel="Back to Sign Up" onClick={() => { window.location.hash = "/"; }}>Back to Sign Up</Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
