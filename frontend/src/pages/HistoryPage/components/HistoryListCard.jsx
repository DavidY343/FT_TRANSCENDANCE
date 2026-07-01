import { useTranslation } from '../../../contexts/LanguageContext';

/*
	prettyResult → Convierte el resultado interno en un texto legible.

	result → Resultado almacenado por el backend.
	replaceAll(...) → Sustituye guiones bajos por espacios.

	Return
	'-' → Si no existe resultado.
	Resultado preparado para mostrar.
*/
function prettyResult(result)
{
	if (!result)
		return '-';

	return ( result.replaceAll('_', ' ') );
}

/*
	getResultClass → Selecciona la clase CSS correspondiente al resultado.

	result → Resultado de la partida para el usuario.

	Return
	Clase de victoria, derrota o tablas.
	'' → Si el resultado no es reconocido.
*/
function getResultClass(result)
{
	if (result === 'win')
		return 'history-result-win';
	if (result === 'loss')
		return 'history-result-loss';
	if (result === 'draw')
		return 'history-result-draw';

	return '';
}
/*
	getOpponentName → Obtiene el nombre visible del oponente.

	game → Partida de la que se obtiene el rival.

	Return
	Display name, username o 'Unknown'.
*/
function getOpponentName(game, t)
{
	return game.opponent?.display_name || game.opponent?.username || t('history.list.unknown');
}

/*
	getPlayersBySide → Coloca al usuario y al rival según su color.

	game → Información de la partida.
	opponent → Nombre visible del rival.

	Return
	Objeto con los nombres de los jugadores blanco y negro.
*/
function getPlayersBySide(game, t)
{
	const opponent = getOpponentName(game, t);

	if (game.my_color === 'b' || game.my_color === 'black')
		return {
			white: opponent,
			black: t('history.list.you'),
		};

	return {
		white: t('history.list.you'),
		black: opponent,
	};
}

/*
	HistoryListCard → Representa los distintos estados del historial.

	games → Partidas recibidas desde el backend.
	loading → Indica si la petición está pendiente.
	error → Mensaje producido si la petición falla.
	onRetry → Función utilizada para repetir la petición.

	getResultClass(...) → Obtiene el estilo del resultado.
	prettyResult(...) → Prepara el resultado para mostrar.
	getPlayersBySide(...) → Ordena los jugadores por color.

	Return
	Estado de carga, error, lista vacía o listado de partidas.
*/
export function HistoryListCard({ games, loading, error, onRetry })
{
	const { t } = useTranslation();

	if (loading)
	{
		return (
			<aside className="card panel-card history-panel">
				<p className="history-empty" aria-live="polite">
					{t('history.list.loading')}
				</p>
			</aside>
		);
	}
	if (error)
	{
		return (
			<aside className="card panel-card history-panel">
				<p className="form-error" role="alert">
					{error}
				</p>

				<button
					className="btn"
					type="button"
					onClick={onRetry}
				>
					{t('history.list.retry')}
				</button>
			</aside>
		);
	}
	if (games.length === 0)
		return (
			<p className="history-empty">
				{t('history.list.no_games')}
			</p>
		);

	return (
		<aside className="card panel-card history-panel">
			<h3 className="panel-title">
				{t('history.list.timeline')}
			</h3>
			<ul className="history-list">
				{games.map((game) => (
					<li key={game.id} className="history-item">
						<div className="history-row-main">
							<strong>{t('history.list.game_id').replace('{id}', game.id)}</strong>

							<span className={`history-result ${getResultClass(game.result_for_me)}`}>
								{prettyResult(game.result_for_me)}
							</span>
						</div>

						<div className="history-sides">
							<div className="history-side history-side-white">
								<span>{t('history.list.white')}</span>
								<strong>{getPlayersBySide(game, t).white}</strong>
							</div>

							<div className="history-side history-side-black">
								<span>{t('history.list.black')}</span>
								<strong>{getPlayersBySide(game, t).black}</strong>
							</div>
						</div>
					</li>
				))}
			</ul>
		</aside>
	);
}
