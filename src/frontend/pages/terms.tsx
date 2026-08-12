
import { Link } from "react-router-dom";
import styles from "../styles/terms.module.css";
import { Navbar } from "../components/landing_nav"

const Terms = () => {
  return (
    <div className={styles.page}>
      <Navbar/>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.title}>Terms &amp; Conditions</h1>
        <p className={styles.subtitle}>
          Motion Graphics Generation — please read carefully before using
          Lunaar's AI motion graphics tools.
        </p>
        <p className={styles.updated}>Last updated: August 12, 2026</p>
      </header>

      <main className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>01</span>
            Acceptance of Terms
          </h2>
          <p className={styles.text}>
            By accessing or using Lunaar's motion graphics generation
            service, you agree to be bound by these Terms &amp; Conditions.
            If you do not agree with any part of these terms, you must not
            use this service.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>02</span>
            Ownership of Assets &amp; Images
          </h2>
          <p className={styles.text}>
            Images, footage, graphics, and other assets used, referenced, or
            incorporated during the generation of clips and videos through
            Lunaar are{" "}
            <strong className={styles.highlight}>
              not the property of Lunaar or any individual associated with
              Lunaar
            </strong>
            . All rights, credit, and courtesy for such assets belong solely
            to the respective original creator, artist, or rights holder.
            Lunaar makes no ownership claim over third-party assets that may
            appear in generated outputs and does not warrant that use of
            such assets is free of third-party rights.
          </p>
          <p className={styles.text}>
            Users are responsible for ensuring they have the appropriate
            rights, licenses, or permissions for any assets they upload or
            request to be used in generation, and for giving proper
            attribution where required by the original rights holder.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>03</span>
            Changes to These Terms
          </h2>
          <p className={styles.text}>
            Lunaar reserves the right to modify, update, or replace these
            Terms &amp; Conditions at any time, at our sole discretion and
            without prior notice. Continued use of the service after any
            changes are posted constitutes acceptance of the revised terms.
            It is your responsibility to review this page periodically.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>04</span>
            Generated Content License
          </h2>
          <p className={styles.text}>
            Subject to your compliance with these terms, Lunaar grants you a
            license to use the clips and videos you generate for personal or
            commercial purposes. This license does not extend to any
            underlying third-party assets, which remain subject to their
            original owners' rights as described above.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>05</span>
            Prohibited Use
          </h2>
          <p className={styles.text}>
            You may not use the service to generate content that is
            unlawful, infringing, defamatory, obscene, or that violates the
            intellectual property or privacy rights of any third party.
            Lunaar reserves the right to suspend or terminate accounts found
            to be in violation of this policy.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>06</span>
            Limitation of Liability
          </h2>
          <p className={styles.text}>
            The service is provided "as is" without warranties of any kind.
            Lunaar shall not be liable for any indirect, incidental, or
            consequential damages arising from your use of the service or
            from any third-party assets appearing in generated content.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>07</span>
            Account Responsibility
          </h2>
          <p className={styles.text}>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activity that occurs under your
            account. Notify us immediately of any unauthorized use.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>08</span>
            Governing Law
          </h2>
          <p className={styles.text}>
            These Terms &amp; Conditions are governed by and construed in
            accordance with applicable local laws, without regard to
            conflict of law principles.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>09</span>
            Contact
          </h2>
          <p className={styles.text}>
            For questions about these Terms &amp; Conditions, reach out
            through the contact options available in your Lunaar dashboard.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} Lunaar. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Terms;