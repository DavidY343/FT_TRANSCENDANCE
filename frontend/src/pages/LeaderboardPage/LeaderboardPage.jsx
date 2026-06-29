import { useEffect, useMemo, useState } from 'react';

import { api, getApiErrorMessage } from '../../api';

import './style/leaderboard.css';

/*
	LeaderboardRow → Representa una posición individual del ranking.

	row → Información del jugador.
	rank → Posición del jugador dentro del ranking.
	displayName → Nombre que se mostrará en la interfaz.

	Return
	Elemento de lista con posición, jugador y puntuación ELO.
*/
function LeaderboardRow({ row, rank })
{
	const displayName = row.display_name || row.username || 'Unknown player';

	return (
		<li className="leaderboard-item">
			<div className="leaderboard-rank">
				<span>#{rank}</span>
			</div>

			<div className="leaderboard-player">
				<strong>{displayName}</strong>
				<span>@{row.username || 'unknown'}</span>
			</div>

			<div className="leaderboard-rating">
				<span>Rating</span>
				<strong>{row.elo ?? '-'}</strong>
			</div>
		</li>
	);
}

/*
	LeaderboardPage → Gestiona y muestra la clasificación de jugadores.

	rows → Lista de jugadores ordenados por ELO.
	loading → Indica si se está cargando la clasificación.
	error → Mensaje producido si la petición falla.
	topPlayer → Primer jugador del ranking.
	topRating → Puntuación ELO más alta disponible.

	loadLeaderboard() → Solicita la clasificación al backend.
	useEffect(...) → Carga la clasificación al montar la página.
	useMemo(...) → Calcula la mejor puntuación cuando cambia el ranking.

	Return
	Resumen de la clasificación y listado de jugadores.
*/
export default function LeaderboardPage()
{
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	/*
		loadLeaderboard → Obtiene la clasificación desde el backend.

		data → Lista de jugadores incluida en la respuesta.
		err → Error producido durante la petición.

		api.get(...) → Solicita el ranking de jugadores.
		getApiErrorMessage(...) → Convierte el error en un mensaje legible.

		Return
		No devuelve ningún valor. Actualiza los estados de la página.
	*/
	async function loadLeaderboard()
	{
		setLoading(true);
		setError('');

		try
		{
			const { data } = await api.get('/games/leaderboard');
			setRows(data);
		}
		catch (err)
		{
			setError(getApiErrorMessage(
				err,
				'Failed to load leaderboard'
			));
		}
		finally
		{
			setLoading(false);
		}
	}
	useEffect(() => {
		loadLeaderboard();
	}, []);

	const topPlayer = rows[0];
	const topRating = useMemo(() => (
		rows.reduce((best, row) => Math.max(best, Number(row.elo) || 0), 0)
	), [rows]);

	return (
		<section className="leaderboard-layout">
			<aside className="card intro-card leaderboard-hero">
				<p className="section-kicker">Ranking</p>

				<h2 className="intro-title">
					Leaderboard
				</h2>

				<p>
					Current standings sorted by rating across the club.
				</p>

				<div className="leaderboard-stats">
					<div className="info-note">
						<span>Players</span>
						<p>{rows.length}</p>
					</div>

					<div className="info-note">
						<span>Top rating</span>
						<p>{topRating || '-'}</p>
					</div>
				</div>

				<div className="leaderboard-champion">
					<span>Current leader</span>
					<strong>{topPlayer?.display_name || topPlayer?.username || '-'}</strong>
				</div>

			</aside>

			<aside className="card panel-card leaderboard-panel">
				<h3 className="panel-title">
					Standings
				</h3>

				{loading ? (
					<p className="leaderboard-empty" aria-live="polite">
						Loading leaderboard...
					</p>
				) : error ? (
					<div>
						<p className="form-error" role="alert">
							{error}
						</p>

						<button
							className="btn"
							type="button"
							onClick={loadLeaderboard}
						>
							Retry
						</button>
					</div>
				) : rows.length === 0 ? (
					<p className="leaderboard-empty">
						No ranking data available.
					</p>
				) : (
					<ol className="leaderboard-list">
						{rows.map((row, index) => (
							<LeaderboardRow
								key={row.id}
								row={row}
								rank={index + 1}
							/>
						))}
					</ol>
				)}
			</aside>
		</section>
	);
}
