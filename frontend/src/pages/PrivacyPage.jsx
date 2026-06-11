export default function PrivacyPage()
{
	return (
		<section className="legal-page">
			<div className="card intro-card legal-card">
				<header className="legal-header">
					<p className="section-kicker">Legal</p>
					<h1 className="intro-title">Privacy Policy</h1>
				</header>

				<div className="legal-grid">
					<article className="legal-item">
						<h2>Data Stored</h2>
						<p>This localhost prototype stores account data, game metadata, and optional avatar files for educational purposes only.</p>
					</article>

					<article className="legal-item">
						<h2>Tracking</h2>
						<p>No third-party ad tracking is used in this implementation.</p>
					</article>
				</div>
			</div>
		</section>
	);
}
