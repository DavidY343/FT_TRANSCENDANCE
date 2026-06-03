import { useEffect, useMemo, useState } from 'react';
import { useSocket } from './useSocket';
import { useInitialState } from './useInitialState';
import { useGameBoard } from './gameBoardHooks/useGameBoard';
import { getPlayerColor, isMyTurn } from './gameRoomUtils';

export function useGameRoom(gameId)
{
	const [moveError, setMoveError] = useState('');

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
		setMoveError,
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

	useEffect(() => {
		if (!moveError)
			return undefined;

		const timeoutId = window.setTimeout(() => {
			setMoveError('');
		}, 2500);

		return () => window.clearTimeout(timeoutId);
	}, [moveError]);

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
		beginDragPiece: board.beginDragPiece,
		endDragPiece: board.endDragPiece,
		dropPiece: board.dropPiece,
		submitMove: board.submitMove,
		squareStyles: board.squareStyles,
		pendingPromotion: board.pendingPromotion,
		confirmPromotion: board.confirmPromotion,
		cancelPromotion: board.cancelPromotion,

		canInteractBoard,
		loading,
		error,
		moveError,
		setError,
		reload,
	};
}
