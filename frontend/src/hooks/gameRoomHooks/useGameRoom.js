import { useEffect, useMemo, useState } from 'react';
import { useSocket } from './useSocket';
import { useInitialState } from './useInitialState';
import { useGameBoard } from './gameBoardHooks/useGameBoard';
import {
	getKingSquareFromFen,
	getLoserColor,
	getPlayerColor,
	isMyTurn,
} from './gameRoomUtils';
import { useGameActions } from './gameBoardHooks/useGameActions';
import { useChat } from './useChat';

export function useGameRoom(gameId)
{
	const [moveError, setMoveError] = useState('');
	const [gameOver, setGameOver] = useState(null);

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
		setGameOver,
	});

	const chat = useChat({ wsRef, setError });

	const actions = useGameActions({
		wsRef,
		setError,
	});

	const myColor = useMemo(() => getPlayerColor(state, me), [state, me]);
	const canInteractBoard = useMemo(() => isMyTurn(state, myColor), [state, myColor]);
	const loserColor = useMemo(() => getLoserColor(gameOver), [gameOver]);
	const loserKingSquare = useMemo(() => (
		getKingSquareFromFen(state?.fen, loserColor)
	), [loserColor, state?.fen]);
	const gameResult = useMemo(() => {
		if (!gameOver || !me)
			return (null);

		if (gameOver.result === 'white_win')
			return (myColor === 'white' ? 'win' : 'lost');

		if (gameOver.result === 'black_win')
			return (myColor === 'black' ? 'win' : 'lost');

		if (!gameOver.winner)
			return ('draw');

		if (gameOver.winner.id === me.id)
			return ('win');

		return ('lost');
	}, [gameOver, me, myColor]);

	const board = useGameBoard({
		wsRef,
		setError,
		canInteractBoard,
		myColor,
		legalMoves: state?.legal_moves || [],
		loserKingSquare,
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
		gameOver,
		gameResult,
		loserKingSquare,
		setError,
		reload,

		chatMessages: state?.chat_messages || [],
		chatMessage: chat.chatMessage,
		setChatMessage: chat.setChatMessage,
		submitChatMessage: chat.submitChatMessage,

		confirmAction: actions.confirmAction,
		requestResign: actions.requestResign,
		cancelAction: actions.cancelAction,
		confirmResign: actions.confirmResign,
	};
}
