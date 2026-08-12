
import styles from "../styles/docs.module.css";
import { Navbar } from "../components/landing_nav";

const steps = [
  {
    number: "01",
    title: "Write your prompt",
    text: "Describe the motion graphic or clip you want to generate — the scene, style, mood, and any text or copy that should appear. The more specific your prompt, the closer the output matches your vision.",
  },
  {
    number: "02",
    title: "Select a provider",
    text: "Choose which AI provider powers your generation: Groq, Claude, or Gemini. Each provider handles prompts a little differently, so you can switch providers to compare results.",
  },
  {
    number: "03",
    title: "Paste your API key",
    text: "Enter your own API key for the selected provider. Your key is stored only in your browser's localStorage and never leaves your machine or touches Lunaar's servers — you'll need to re-enter it if you clear your browser storage or switch devices.",
  },
  {
    number: "04",
    title: "Upload images and assign roles",
    text: "Upload any images you want included in the clip. Click on an uploaded image to open its role selector and assign it as a Logo, Product, Background, or Person, so the generator knows how to place it in the final video.",
  },
  {
    number: "05",
    title: "Generate your clip",
    text: "Start generation once your prompt, provider, and assets are set. Clip generation can take up to 4 minutes or longer depending on provider load and clip complexity — keep the tab open while it processes.",
  },
  {
    number: "06",
    title: "No images? We fill the gaps",
    text: "If you don't upload your own images, Lunaar automatically imports relevant images from Pixabay to use in your generated clip.",
  },
];

const Docs = () => {
  return (
    <div className={styles.page}>
      <Navbar />

      <header className={styles.hero}>
        <p className={styles.eyebrow}>Documentation</p>
        <h1 className={styles.title}>How to use Lunaar</h1>
        <p className={styles.subtitle}>
          A step-by-step guide to generating motion graphics — from prompt
          to finished clip.
        </p>
      </header>

      <main className={styles.content}>
        <section className={styles.stepsSection}>
          {steps.map((step) => (
            <div key={step.number} className={styles.stepCard}>
              <span className={styles.stepNumber}>{step.number}</span>
              <div className={styles.stepBody}>
                <h2 className={styles.stepTitle}>{step.title}</h2>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.noteSection}>
          <h2 className={styles.noteTitle}>Generation limits</h2>
          <div className={styles.noteGrid}>
            <div className={styles.noteCard}>
              <span className={styles.noteHighlight}>6 videos</span>
              <p className={styles.noteText}>
                You can generate up to 6 videos before reaching your limit.
              </p>
            </div>
            <div className={styles.noteCard}>
              <span className={styles.noteHighlight}>2 hour reset</span>
              <p className={styles.noteText}>
                Once you hit the limit, your count restarts back at 0 after
                2 hours.
              </p>
            </div>
            <div className={styles.noteCard}>
              <span className={styles.noteHighlight}>~4 min+</span>
              <p className={styles.noteText}>
                Clip generation typically takes up to 4 minutes or more to
                complete.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.tipSection}>
          <h2 className={styles.tipTitle}>Quick tips</h2>
          <ul className={styles.tipList}>
            <li className={styles.tipItem}>
              Your API key is only ever stored in your browser's
              localStorage — clearing site data removes it.
            </li>
            <li className={styles.tipItem}>
              Click any uploaded image at any time to change its assigned
              role before generating.
            </li>
            <li className={styles.tipItem}>
              If generation is taking longer than expected, keep the tab
              open — closing it may interrupt the process.
            </li>
            <li className={styles.tipItem}>
              Assets you don't provide are automatically sourced from
              Pixabay to keep your clip complete.
            </li>
          </ul>
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

export default Docs;