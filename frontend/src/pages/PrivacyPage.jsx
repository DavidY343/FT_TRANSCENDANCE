export default function PrivacyPage() {
  return (
    <section className="card legal-layout">
      <p className="section-kicker">Legal</p>
      <h2>Privacy Policy</h2>
      <div className="legal-grid">
        <article>
          <h3>Data Stored</h3>
          <p>This localhost prototype stores account data, game metadata, and optional avatar files for educational purposes only.</p>
        </article>
        <article>
          <h3>Tracking</h3>
          <p>No third-party ad tracking is used in this implementation.</p>
        </article>
      </div>
    </section>
  );
}
