import { useTranslation } from '../../../../contexts/LanguageContext';
import { GameBoard } from "./GameBoard";
import { Actions } from "./Actions";
import { Clocks } from "./Clocks";

export function BoardArea({ room })
{
	const { t } = useTranslation();
	const state = room?.state;

	function getFigurineNotation(sanMove) {
		if (!sanMove) return null;
		return sanMove
			.replace(/N/g, '♞')
			.replace(/B/g, '♝')
			.replace(/R/g, '♜')
			.replace(/Q/g, '♛')
			.replace(/K/g, '♚');
	}

	return (
		<main className="game-board-area">
			<Clocks
				clocks={state?.clocks}
				turn={state?.turn}
				players={{
					white: state?.players?.white?.display_name || state?.players?.white?.username || t('color.white'),
					black: state?.players?.black?.display_name || state?.players?.black?.username || t('color.black'),
				}}
			/>

			<section className="card board-card">
				<div className="moves-strip">
					<span>
						{state?.is_check ? t('game.check') : t('game.move')}
					</span>
					<strong>
						{state?.is_check ? t('game.king_under_attack') : getFigurineNotation(state?.last_move_san) || state?.last_move || t('game.opening_position')}
					</strong>
				</div>

				<GameBoard room={room} />

				<Actions room={room}/>
			</section>
		</main>
	);
}
