import './style/legal.css';

export default function TermsPage()
{
	return (
		<section className="legal-page">
			<div className="card intro-card legal-card">
				<header className="legal-header">
					<p className="section-kicker">Legal</p>
					<h1 className="intro-title">Terms of Service</h1>
					<p className="legal-intro">
						Last updated: June 2026. These Terms of Service ("Terms") govern your
						access to and use of <strong>Checkmate Club</strong>, an online chess
						platform ("Service") developed as part of the ft_transcendence project
						at 42 School. By registering an account or using the Service you agree
						to be bound by these Terms.
					</p>
				</header>

				<div className="legal-grid">
					<article className="legal-item">
						<h2>1. Acceptance of Terms</h2>
						<p>
							By creating an account or otherwise accessing the Service, you confirm
							that you have read, understood, and agree to these Terms. If you do not
							agree, you must not use the Service. We reserve the right to update
							these Terms at any time; your continued use of the Service after an
							update constitutes acceptance of the revised Terms.
						</p>
					</article>

					<article className="legal-item">
						<h2>2. Eligibility</h2>
						<p>
							You must be at least 13 years old to use Checkmate Club. By using the
							Service you represent that you meet this requirement. If you are using
							the Service on behalf of an organisation, you represent that you have
							authority to bind that organisation to these Terms.
						</p>
					</article>

					<article className="legal-item">
						<h2>3. Account Registration</h2>
						<p>
							To access most features you must register an account with a unique
							username and a secure password. You are responsible for:
						</p>
						<ul>
							<li>Providing accurate information during registration.</li>
							<li>Keeping your password confidential and not sharing it with others.</li>
							<li>All activity that occurs under your account, whether or not authorised by you.</li>
							<li>Notifying us immediately if you suspect unauthorised access to your account.</li>
						</ul>
						<p>
							We reserve the right to suspend or terminate accounts that violate
							these Terms or that have been inactive for an extended period.
						</p>
					</article>

					<article className="legal-item">
						<h2>4. Acceptable Use</h2>
						<p>
							You agree to use the Service only for lawful purposes and in a manner
							consistent with fair play. The following conduct is strictly prohibited:
						</p>
						<ul>
							<li><strong>Cheating:</strong> Using chess engines, bots, or third-party assistance tools during rated games.</li>
							<li><strong>Abuse:</strong> Harassing, threatening, or sending offensive messages to other users via the in-game chat.</li>
							<li><strong>Impersonation:</strong> Creating accounts that impersonate other users or public figures.</li>
							<li><strong>Exploitation:</strong> Deliberately exploiting bugs or vulnerabilities to gain an unfair advantage or disrupt the Service.</li>
							<li><strong>Unauthorised access:</strong> Attempting to access accounts, databases, or server resources that are not your own.</li>
							<li><strong>Automated scraping:</strong> Using bots or scripts to collect user data without permission.</li>
							<li><strong>Illegal content:</strong> Uploading avatar images or sending chat messages that contain illegal or prohibited content.</li>
						</ul>
						<p>
							Violations may result in immediate account suspension or permanent ban
							without prior notice, at our sole discretion.
						</p>
					</article>

					<article className="legal-item">
						<h2>5. Fair Play and ELO Rating</h2>
						<p>
							Checkmate Club uses an ELO-based rating system to rank players. The
							integrity of the rating system relies on honest play. Intentionally
							losing games to manipulate your own or another player's ELO rating is
							prohibited and may result in account termination and ELO adjustment.
						</p>
						<p>
							Abandoning games repeatedly without good reason is considered
							unsportsmanlike. The platform enforces a 30-second reconnection grace
							period; failure to reconnect results in a forfeit and an ELO penalty.
						</p>
					</article>

					<article className="legal-item">
						<h2>6. User Content</h2>
						<p>
							You retain ownership of content you submit to the Service, such as your
							avatar image. By uploading content, you grant us a non-exclusive,
							worldwide, royalty-free licence to store, display, and serve that
							content solely for the purpose of operating the Service.
						</p>
						<p>
							You represent that you have the right to grant this licence and that
							your content does not infringe any third-party intellectual property
							rights. We reserve the right to remove any content that violates these
							Terms or applicable law.
						</p>
					</article>

					<article className="legal-item">
						<h2>7. Intellectual Property</h2>
						<p>
							The Checkmate Club platform, including its source code, design, and
							branding, is developed as an educational project under the
							ft_transcendence curriculum. The chess rules engine used by the
							platform is provided by the open-source <strong>python-chess</strong>
							library under the GPL-3.0 licence.
						</p>
						<p>
							Nothing in these Terms transfers any intellectual property rights to
							you beyond the limited right to use the Service as described herein.
						</p>
					</article>

					<article className="legal-item">
						<h2>8. Service Availability</h2>
						<p>
							Checkmate Club is provided as-is and on an as-available basis. As a
							student project, the Service may be taken offline, modified, or
							discontinued at any time without notice. We do not guarantee
							continuous, uninterrupted, or error-free operation of the Service.
						</p>
					</article>

					<article className="legal-item">
						<h2>9. Disclaimer of Warranties</h2>
						<p>
							To the maximum extent permitted by applicable law, the Service is
							provided <strong>"as is"</strong> without warranties of any kind,
							either express or implied, including but not limited to implied
							warranties of merchantability, fitness for a particular purpose, and
							non-infringement.
						</p>
					</article>

					<article className="legal-item">
						<h2>10. Limitation of Liability</h2>
						<p>
							To the fullest extent permitted by law, the authors of Checkmate Club
							shall not be liable for any indirect, incidental, special,
							consequential, or punitive damages arising out of or related to your
							use of or inability to use the Service.
						</p>
						<p>
							Because this is a student project with no commercial activity, our
							total aggregate liability to you for any claim arising from these
							Terms or your use of the Service shall not exceed zero euros (EUR 0).
						</p>
					</article>

					<article className="legal-item">
						<h2>11. Governing Law</h2>
						<p>
							These Terms shall be governed by and construed in accordance with the
							laws of the jurisdiction in which the project is hosted, without regard
							to its conflict-of-law provisions.
						</p>
					</article>

					<article className="legal-item">
						<h2>12. Contact</h2>
						<p>
							For any questions about these Terms of Service, please contact the
							project team through your institution's official communication
							channels. This Service is a student project developed as part of the
							ft_transcendence curriculum at 42 School.
						</p>
					</article>
				</div>
			</div>
		</section>
	);
}
