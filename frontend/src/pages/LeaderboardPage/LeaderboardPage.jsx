import { useEffect, useMemo, useState } from 'react';

import { Link } from 'react-router-dom';
import { api, getApiErrorMessage } from '../../api';
import { useTranslation } from '../../contexts/LanguageContext';

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
	const { t } = useTranslation();
	const displayName = row.display_name || row.username || t('leaderboard.unknown_player');

	return (
		<li className="leaderboard-item">
			<div className="leaderboard-rank">
				<span>#{rank}</span>
			</div>

			<div className="leaderboard-player">
				<strong>
					<Link to={`/profile/${row.id}`} className="profile-link">
						{displayName}
					</Link>
				</strong>
				<span>
					<Link to={`/profile/${row.id}`} className="profile-link">
						@{row.username || t('leaderboard.unknown_username')}
					</Link>
				</span>
			</div>

			<div className="leaderboard-rating">
				<span>{t('leaderboard.rating')}</span>
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
	const { t } = useTranslation();
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
				<p className="section-kicker">{t('leaderboard.kicker')}</p>

				<h2 className="intro-title">
					{t('leaderboard.title')}
				</h2>

				<p>
					{t('leaderboard.desc')}
				</p>

				<div className="leaderboard-stats">
					<div className="info-note">
						<span>{t('leaderboard.players_count')}</span>
						<p>{rows.length}</p>
					</div>

					<div className="info-note">
						<span>{t('leaderboard.top_rating')}</span>
						<p>{topRating || '-'}</p>
					</div>
				</div>

				<div className="leaderboard-champion">
					<span>{t('leaderboard.current_leader')}</span>
					<strong>{topPlayer?.display_name || topPlayer?.username || '-'}</strong>
				</div>

			</aside>

			<aside className="card panel-card leaderboard-panel">
				<h3 className="panel-title">
					{t('leaderboard.standings')}
				</h3>

				{loading ? (
					<p className="leaderboard-empty" aria-live="polite">
						{t('leaderboard.loading')}
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
							{t('leaderboard.retry')}
						</button>
					</div>
				) : rows.length === 0 ? (
					<p className="leaderboard-empty">
						{t('leaderboard.empty')}
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
