import Link from "next/link";
import { WeddingMark } from "@/components/templates/wedding-mark";
import styles from "./auth.module.css";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <section className={styles.identity} aria-label="Written Dearly">
          <Link href="/" className={styles.brand} aria-label="Written Dearly home">
            <WeddingMark variant="monogram" />
            <span>Written Dearly<small>THE WEDDING WORKSPACE</small></span>
          </Link>
          <div className={styles.story}>
            <WeddingMark variant="crest" />
            <p>Thoughtfully planned.<br />Beautifully shared.</p>
            <span>A little space for your big day.</span>
          </div>
          <p className={styles.caption}>Your invitation. Your people. Your celebration.</p>
        </section>
        {children}
      </div>
    </main>
  );
}
