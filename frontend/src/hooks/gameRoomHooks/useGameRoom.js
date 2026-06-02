import { useMemo } from 'react';
import { useSocket } from './useSocket';
import { useInitialState } from './useInitialState';
import { useGameBoard } from './useGameBoard';
import { getPlayerColor, isMyTurn } from './gameRoomUtils';

export function useGameRoom(gameId)
{

	const {
		state,
		setState,
		me,
		loading,
		error,
		setError,
		reload,
	} = useInitialState(gameId);

	const {
		wsRef,
		wsStatus,
	} = useSocket({
		gameId,
		setState,
		setError,
	});


	const myColor = useMemo(() => getPlayerColor(state, me), [state, me]);
	const canInteractBoard = useMemo(() => isMyTurn(state, myColor), [state, myColor]);

	const board = useGameBoard({
		wsRef,
		setError,
		canInteractBoard,
		myColor,
		legalMoves: state?.legal_moves || [],
	});

	return {
		state,
		setState,
		me,
		myColor,

		wsRef,
		wsStatus,

		selectedSquare: board.selectedSquare,
		selectPiece: board.selectPiece,
		selectTarget: board.selectTarget,
		submitMove: board.submitMove,
		squareStyles: board.squareStyles,

		canInteractBoard,
		loading,
		error,
		setError,
		reload,
	};
}
