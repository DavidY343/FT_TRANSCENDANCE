import { useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '../../api';
import { HistoryListCard } from './components/HistoryListCard';
import { useTranslation } from '../../contexts/LanguageContext';

import './style/history.css';
import cardsStyles from '../../styles/cards/cards.module.css';
import introCardsStyles from '../../styles/cards/intro-cards.module.css';

/*
	HistoryPage → Gestiona y muestra el historial de partidas del usuario.

	games → Lista de partidas recibida desde el backend.
	loading → Indica si se está cargando el historial.
	error → Mensaje producido si la petición falla.

	loadHistory() → Solicita el historial y actualiza sus estados.
	useEffect(...) → Carga el historial al montar la página.
	api.get(...) → Realiza la petición al endpoint de historial.
	setGames(...) → Guarda las partidas recibidas.
	setLoading(...) → Activa o desactiva el estado de carga.
	setError(...) → Guarda o limpia el mensaje de error.

	Return
	Sección con el resumen y la lista del historial.
*/

export default function HistoryPage()
{
	const { t } = useTranslation();
	const [games, setGames] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	/*
		loadHistory → Obtiene el historial de partidas desde el backend.

		data → Lista de partidas incluida en la respuesta.
		err → Error producido durante la petición.

		api.get(...) → Solicita las partidas del usuario.
		getApiErrorMessage(...) → Convierte el error en un mensaje legible.

		Return
		No devuelve ningún valor. Actualiza los estados de la página.
	*/
	async function loadHistory()
	{
		setLoading(true);
		setError('');

		try
		{
			const { data } = await api.get('/games/history');
			setGames(data);
		}
		catch (err)
		{
			setError(getApiErrorMessage(err, 'Failed to load history'));
		}
		finally
		{
			setLoading(false);
		}
	}

	useEffect(() => {
		loadHistory();
	}, []);

	return (
		<section className="history-layout">
			<aside className={`${cardsStyles.card} ${introCardsStyles.introCard} history-hero`}>
				<p className={`${introCardsStyles.sectionKicker}`}>{t('history.kicker')}</p>

				<h2 className={`${introCardsStyles.introTitle}`}>
					{t('history.title')}
				</h2>

				<p>
					{t('history.desc')}
				</p>

				<div className="history-stats">
					<div className={`${introCardsStyles.infoNote}`}>
						<span>{t('history.total_games')}</span>
						<p>{games.length}</p>
					</div>

					<div className={`${introCardsStyles.infoNote}`}>
						<span>{t('history.last_result')}</span>
						<p>{games[0]?.result_for_me?.replaceAll('_', ' ') || '-'}</p>
					</div>
				</div>

			</aside>

			<HistoryListCard
				games={games}
				loading={loading}
				error={error}
				onRetry={loadHistory}
			/>
		</section>
	);
}
