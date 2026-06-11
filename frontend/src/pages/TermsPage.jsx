export default function TermsPage()
{
	return (
		<section className="legal-page">
			<div className="card intro-card legal-card">
				<header className="legal-header">
					<p className="section-kicker">Legal</p>
					<h1 className="intro-title">Terms of Service</h1>
				</header>

				<div className="legal-grid">
					<article className="legal-item">
						<h2>Scope</h2>
						<p>This service is a student project prototype. Use at your own risk and avoid uploading sensitive personal data.</p>
					</article>

					<article className="legal-item">
						<h2>Fair Use</h2>
						<p>Cheating, abuse, and unauthorized access attempts are prohibited.</p>
					</article>
				</div>
			</div>
		</section>
	);
}
