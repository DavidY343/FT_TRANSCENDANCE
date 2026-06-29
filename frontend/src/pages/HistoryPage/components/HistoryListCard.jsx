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
function getOpponentName(game)
{
	return game.opponent?.display_name || game.opponent?.username || 'Unknown';
}

/*
	getPlayersBySide → Coloca al usuario y al rival según su color.

	game → Información de la partida.
	opponent → Nombre visible del rival.

	Return
	Objeto con los nombres de los jugadores blanco y negro.
*/
function getPlayersBySide(game)
{
	const opponent = getOpponentName(game);

	if (game.my_color === 'b' || game.my_color === 'black')
		return {
			white: opponent,
			black: 'You',
		};

	return {
		white: 'You',
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
	if (loading)
	{
		return (
			<aside className="card panel-card history-panel">
				<p className="history-empty" aria-live="polite">
					Loading match history...
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
					Retry
				</button>
			</aside>
		);
	}
	if (games.length === 0)
		return (
			<p className="history-empty">
				No games recorded yet.
			</p>
		);

	return (
		<aside className="card panel-card history-panel">
			<h3 className="panel-title">
				Timeline
			</h3>
			<ul className="history-list">
				{games.map((game) => (
					<li key={game.id} className="history-item">
						<div className="history-row-main">
							<strong>Game #{game.id}</strong>

							<span className={`history-result ${getResultClass(game.result_for_me)}`}>
								{prettyResult(game.result_for_me)}
							</span>
						</div>

						<div className="history-sides">
							<div className="history-side history-side-white">
								<span>White</span>
								<strong>{getPlayersBySide(game).white}</strong>
							</div>

							<div className="history-side history-side-black">
								<span>Black</span>
								<strong>{getPlayersBySide(game).black}</strong>
							</div>
						</div>
					</li>
				))}
			</ul>
		</aside>
	);
}
