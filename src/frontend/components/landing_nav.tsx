import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import styles from "../Styles/Nav_landing.module.css";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavbarProps {
  logoText?: string;
  links?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  onSecondaryClick?: () => void;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: "Terms", href: "terms" },
  { label: "Docs", href: "docs" },
];

export function Navbar({
  logoText = "Lunaar",
  links = DEFAULT_LINKS,
  ctaLabel = "Sign up",
  ctaHref = "login",
  onCtaClick,
  secondaryLabel = "Log in",
  secondaryHref = "login",
  onSecondaryClick,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLinkClick = (href: string) => {
    setActiveHref(href);
    setMenuOpen(false);
  };

  return (
    <header className={styles.navRoot}>
      <nav className={styles.nav} aria-label="Primary">
        <a
          href="#top"
          className={styles.logo}
          onClick={() => handleLinkClick("#top")}
          aria-label={`${logoText} home`}
        >
          {logoText}
        </a>
        <ul className={styles.linkList}>
          {links.map((link) => (
            <li key={link.href} className={styles.linkItem}>
              <a
                href={link.href}
                className={`${styles.link} ${
                  activeHref === link.href ? styles.linkActive : ""
                }`}
                onClick={() => handleLinkClick(link.href)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <a
            href={secondaryHref}
            className={styles.secondaryButton}
            onClick={onSecondaryClick}
          >
            {secondaryLabel}
          </a>
          <a
            href={ctaHref}
            className={styles.ctaButton}
            onClick={onCtaClick}
          >
            {ctaLabel}
          </a>
        </div>
        <button
          type="button"
          className={styles.menuToggle}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <X className={styles.menuIcon} strokeWidth={2} />
          ) : (
            <Menu className={styles.menuIcon} strokeWidth={2} />
          )}
        </button>
      </nav>
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}>
        <ul className={styles.mobileLinkList}>
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`${styles.mobileLink} ${
                  activeHref === link.href ? styles.mobileLinkActive : ""
                }`}
                onClick={() => handleLinkClick(link.href)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.mobileActions}>
          <a
            style={{textDecoration:"none"}}
            href={secondaryHref}
            className={styles.secondaryButton}
            onClick={() => {
              setMenuOpen(false);
              onSecondaryClick?.();
            }}
          >
            {secondaryLabel}
          </a>
          <a
          style={{textDecoration:"none"}}
            href={ctaHref}
            className={styles.ctaButton}
            onClick={() => {
              setMenuOpen(false);
              onCtaClick?.();
            }}
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
