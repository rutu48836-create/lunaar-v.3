
import React from "react";

/**
 * Refund Policy page.
 * Single-file, self-contained component — drop straight in as App.jsx.
 * No external assets, no Tailwind/compiler dependency — plain inline styles
 * so it renders identically wherever it's pasted.
 */

const colors = {
  ink: "#1A1A1A",
  paper: "#FAFAF8",
  rule: "#E3E1DA",
  muted: "#6B6862",
  accent: "#B3451D", // terracotta — used once, for the no-refund callout
  accentBg: "#FBEEE7",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: colors.paper,
    color: colors.ink,
    fontFamily:
      '"Iowan Old Style", "Palatino Linotype", Georgia, "Times New Roman", serif',
    display: "flex",
    justifyContent: "center",
    padding: "64px 24px 96px",
    boxSizing: "border-box",
  },
  container: {
    width: "100%",
    maxWidth: 720,
  },
  eyebrow: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fontSize: 12,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 12,
    fontWeight: 600,
  },
  h1: {
    fontSize: "clamp(32px, 5vw, 44px)",
    lineHeight: 1.15,
    margin: "0 0 8px",
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  updated: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fontSize: 13,
    color: colors.muted,
    marginBottom: 40,
  },
  rule: {
    border: "none",
    borderTop: `1px solid ${colors.rule}`,
    margin: "40px 0",
  },
  calloutWrap: {
    margin: "8px 0 40px",
  },
  callout: {
    background: colors.accentBg,
    border: `1px solid ${colors.accent}33`,
    borderLeft: `3px solid ${colors.accent}`,
    borderRadius: 4,
    padding: "20px 24px",
  },
  calloutLabel: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: colors.accent,
    fontWeight: 700,
    marginBottom: 8,
  },
  calloutText: {
    fontSize: 17,
    lineHeight: 1.55,
    margin: 0,
    color: colors.ink,
  },
  h2: {
    fontSize: 20,
    fontWeight: 600,
    margin: "0 0 14px",
    letterSpacing: "-0.005em",
  },
  section: {
    marginBottom: 36,
  },
  p: {
    fontSize: 16,
    lineHeight: 1.7,
    color: "#2E2C28",
    margin: "0 0 14px",
  },
  ul: {
    margin: "0 0 14px",
    paddingLeft: 20,
  },
  li: {
    fontSize: 16,
    lineHeight: 1.7,
    color: "#2E2C28",
    marginBottom: 8,
  },
  footer: {
    marginTop: 56,
    paddingTop: 24,
    borderTop: `1px solid ${colors.rule}`,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fontSize: 13,
    color: colors.muted,
    lineHeight: 1.6,
  },
  link: {
    color: colors.ink,
    textDecoration: "underline",
    textDecorationColor: colors.rule,
    textUnderlineOffset: 3,
  },
};

export default function Refund() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.eyebrow}>Policies</div>
        <h1 style={styles.h1}>Refund Policy</h1>
        <div style={styles.updated}>Last updated: June 19, 2026</div>

        <div style={styles.calloutWrap}>
          <div style={styles.callout}>
            <div style={styles.calloutLabel}>No refunds on cancellation</div>
            <p style={styles.calloutText}>
              When you cancel your plan, no refunds are issued for any
              remaining time, unused features, or fees already charged.
              Cancellation stops future billing only — it does not reverse
              past payments.
            </p>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.h2}>How cancellation works</h2>
          <p style={styles.p}>
            You can cancel your plan at any time from your account settings.
            Once cancelled, you'll keep access to your plan's features until
            the end of the current billing period, after which your
            subscription will not renew.
          </p>
          <p style={styles.p}>
            No partial or prorated refund is issued for the time remaining in
            the billing period at the point of cancellation.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.h2}>Charges already processed</h2>
          <ul style={styles.ul}>
            <li style={styles.li}>
              All payments already processed are final and non-refundable.
            </li>
            <li style={styles.li}>
              This applies to monthly and annual billing cycles alike.
            </li>
            <li style={styles.li}>
              This applies regardless of how much of the plan or its features
              you used during the billing period.
            </li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.h2}>Downgrades and plan changes</h2>
          <p style={styles.p}>
            Switching to a lower-priced plan takes effect at the start of
            your next billing cycle. The difference for the current cycle is
            not refunded.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.h2}>Exceptions</h2>
          <p style={styles.p}>
            Refunds may be granted where required by applicable law, or at
            our sole discretion in cases of a verified billing error on our
            part. Outside of these cases, the no-refund policy above applies.
          </p>
        </div>

        <hr style={styles.rule} />

        <div style={styles.footer}>
          Questions about a charge or your subscription? Contact{" "}
          <a href="mailto:lunaaroffical@gmail.com" style={styles.link}>
            lunaar.online
          </a>
          .
        </div>
      </div>
    </div>
  );
}
