export function DisconnectGraceModal({ room })
{
	const disconnectGrace = room?.state?.disconnect_grace;
	const showModal = Boolean(
		disconnectGrace?.active
		&& disconnectGrace.user_id !== room?.me?.id
	);

	if (!showModal)
		return (null);

	return (
		<div className="result-backdrop disconnect-grace-backdrop">
			<div className="card result-card disconnect-grace-card">
				<p className="section-kicker">
					Opponent disconnected
				</p>

				<h2 className="disconnect-grace-title">
					{disconnectGrace.seconds ?? '-'}s
				</h2>

				<p className="disconnect-grace-copy">
					Forfeit countdown
				</p>
			</div>
		</div>
	);
}
