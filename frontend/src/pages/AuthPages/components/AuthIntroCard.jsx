export function RegisterIntroCard()
{
	return (
		<article className="card auth-card intro-card">
			<p className="section-kicker">
				New Membership
			</p>

			<h2 className="intro-title">
				Join the club.
			</h2>

			<p>
				Set your name on the ledger, claim your table and start playing rapid
				duels, quiet endgames and reckless attacks against friends or AI.
			</p>

			<div className="info-note">
				<span>
					Entry standard
				</span>

				<p>
					Bring a valid email, a solid alias and enough patience for your first
					opening mistake.
				</p>
			</div>
		</article>
	);
}

export function LoginIntroCard()
{
	return (
		<article className="card auth-card intro-card">
			<p className="section-kicker">
				Members Entrance
			</p>

			<h2 className="intro-title">
				Return to the board.
			</h2>

			<p>
				Pick up unfinished rivalries, review your last games and step back
				into a room that looks like it has been waiting for you all evening...
			</p>

			<div className="info-note">
				<span>
					House note
				</span>

				<p>
					Best experienced with coffee nearby and your queen protected.
				</p>
			</div>
		</article>
	);
}
