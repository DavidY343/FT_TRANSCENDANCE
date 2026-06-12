import './style/legal.css';

export default function PrivacyPage()
{
	return (
		<section className="legal-page">
			<div className="card intro-card legal-card">
				<header className="legal-header">
					<p className="section-kicker">Legal</p>
					<h1 className="intro-title">Privacy Policy</h1>
					<p className="legal-intro">
						Last updated: June 2026. This Privacy Policy explains how
						<strong> Checkmate Club</strong> ("we", "us", or "our") collects,
						uses, stores and protects information about you when you use our
						online chess platform. By registering an account or using the
						service, you agree to the practices described below.
					</p>
				</header>

				<div className="legal-grid">
					<article className="legal-item">
						<h2>1. Information We Collect</h2>
						<p>When you create an account we collect the following personal data:</p>
						<ul>
							<li><strong>Account credentials:</strong> username, display name, and a securely hashed password.</li>
							<li><strong>Profile information:</strong> optional avatar image you choose to upload.</li>
							<li><strong>Game data:</strong> chess positions, move history, game results, and ELO ratings.</li>
							<li><strong>Connection metadata:</strong> your online/offline status for the Friends feature.</li>
						</ul>
						<p>
							We do <strong>not</strong> collect your real name, physical address,
							phone number, or payment information. No payment processing takes
							place on this platform.
						</p>
					</article>

					<article className="legal-item">
						<h2>2. How We Use Your Information</h2>
						<p>Your data is used solely to operate the Checkmate Club service:</p>
						<ul>
							<li>Authenticate you and maintain your session securely using JWT tokens stored in browser session storage.</li>
							<li>Render your profile, ELO ranking, and game history.</li>
							<li>Match you with opponents via the matchmaking queue.</li>
							<li>Display your online status to users you have added as friends.</li>
							<li>Maintain chat logs within active game rooms, limited to the last 100 messages per room and held in memory only.</li>
						</ul>
						<p>
							We do <strong>not</strong> use your data for advertising, profiling,
							or automated decision-making that produces legal or similarly
							significant effects.
						</p>
					</article>

					<article className="legal-item">
						<h2>3. Data Storage and Retention</h2>
						<p>
							Account and game data are stored in a PostgreSQL database hosted
							within the same infrastructure as the application. Avatar images are
							stored on the server filesystem under a protected upload directory.
						</p>
						<p>
							We retain your account data for as long as your account is active. If
							you request deletion of your account, all associated personal data,
							including your profile, game records and avatar, will be permanently
							removed within 30 days of the request.
						</p>
					</article>

					<article className="legal-item">
						<h2>4. Cookies and Session Storage</h2>
						<p>
							Checkmate Club does <strong>not</strong> use browser cookies for
							authentication. Access tokens and refresh tokens are stored
							exclusively in <code>sessionStorage</code>, which is automatically
							cleared when you close the browser tab or window.
						</p>
						<p>
							No persistent tracking cookies or third-party analytics cookies are
							set by this application.
						</p>
					</article>

					<article className="legal-item">
						<h2>5. Third-Party Services</h2>
						<p>
							This platform does not integrate third-party advertising networks,
							social login providers, analytics SDKs, or data brokers. No personal
							data is shared with, sold to, or transferred to any external party.
						</p>
					</article>

					<article className="legal-item">
						<h2>6. Your Rights</h2>
						<p>
							Depending on your jurisdiction you may have rights regarding your
							personal data, including the right to access, correct, or delete it.
						</p>
						<ul>
							<li><strong>Access / Correction:</strong> Update your display name and avatar directly from your Profile page.</li>
							<li><strong>Deletion:</strong> Contact us to request complete account deletion.</li>
							<li><strong>Data portability:</strong> You may request an export of your game history in JSON format.</li>
						</ul>
					</article>

					<article className="legal-item">
						<h2>7. Security</h2>
						<p>We take reasonable technical measures to protect your data:</p>
						<ul>
							<li>Passwords are hashed using bcrypt before storage.</li>
							<li>All API communication is intended to be served over HTTPS in production.</li>
							<li>JWT access tokens have a short expiry and are not stored in cookies.</li>
							<li>Avatar upload filenames are sanitized and stored outside the web root.</li>
						</ul>
						<p>
							No system is perfectly secure. If you discover a vulnerability,
							please report it responsibly before public disclosure.
						</p>
					</article>

					<article className="legal-item">
						<h2>8. Children's Privacy</h2>
						<p>
							Checkmate Club is not directed at children under the age of 13. We do
							not knowingly collect personal data from children under 13. If you
							believe a child has provided us with personal information, please
							contact us and we will delete it promptly.
						</p>
					</article>

					<article className="legal-item">
						<h2>9. Changes to This Policy</h2>
						<p>
							We may update this Privacy Policy from time to time. The "Last
							updated" date at the top of this page will reflect the most recent
							revision. Continued use of the service after changes are published
							constitutes acceptance of the updated policy.
						</p>
					</article>

					<article className="legal-item">
						<h2>10. Contact</h2>
						<p>
							If you have any questions, concerns, or requests relating to this
							Privacy Policy or your personal data, please contact the project team
							through your institution's official communication channels. This
							platform is a student project developed as part of the ft_transcendence
							curriculum at 42 School.
						</p>
					</article>
				</div>
			</div>
		</section>
	);
}
