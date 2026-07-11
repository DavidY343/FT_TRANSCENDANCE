import { useEffect, useMemo, useState } from 'react';
import { useSocket } from './useSocket';
import { useInitialState } from './useInitialState';
import { useGameBoard } from './gameBoardHooks/useGameBoard';
import {
	getKingSquareFromFen,
	getLoserColor,
	getPlayerColor,
	isMyTurn,
} from './roomUtils';
import { useGameActions } from './gameBoardHooks/useGameActions';
import { useChat } from './useChat';

export function useRoom(gameId)
{
	const [moveError, setMoveError] = useState('');
	const [gameOver, setGameOver] = useState(null);
	const [stableOpponentGrace, setStableOpponentGrace] = useState(null);
	const [graceTick, setGraceTick] = useState(Date.now());

	const {
		state,
		setState,
		me,
		initialGame,
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

	const opponentGraceActive = useMemo(() => (
		Boolean(stableOpponentGrace)
		&& stableOpponentGrace.endsAt > graceTick
	), [graceTick, stableOpponentGrace]);

	const canInteractBoard = useMemo(() => (
		isMyTurn(state, myColor)
	), [myColor, state]);

	useEffect(() => {
		const disconnectGrace = state?.disconnect_grace;

		if (
			!disconnectGrace?.active
			|| !me
			|| disconnectGrace.user_id === me.id
		)
			return;

		const seconds = Math.max(0, Number(disconnectGrace.seconds) || 0);

		setStableOpponentGrace({
			...disconnectGrace,
			endsAt: Date.now() + (seconds * 1000),
			showAfter: Date.now() + 5000,
		});
	}, [
		me,
		state?.disconnect_grace?.active,
		state?.disconnect_grace?.seconds,
		state?.disconnect_grace?.user_id,
	]);

	useEffect(() => {
		if (!stableOpponentGrace)
			return undefined;

		if (state?.presence?.[stableOpponentGrace.user_id] === true)
		{
			setStableOpponentGrace(null);
			return undefined;
		}

		if (gameOver || stableOpponentGrace.endsAt <= Date.now())
		{
			setStableOpponentGrace(null);
			return undefined;
		}

		const intervalId = window.setInterval(() => {
			setGraceTick(Date.now());
		}, 250);

		return () => window.clearInterval(intervalId);
	}, [gameOver, stableOpponentGrace, state?.presence]);

	useEffect(() => {
		if (
			gameOver
			|| !initialGame
			|| initialGame.status !== 'finished'
			|| !initialGame.result
		)
			return;

		const winner = initialGame.result === 'white_win'
			? initialGame.white
			: initialGame.black;

		setGameOver({
			result: initialGame.result,
			winner: initialGame.result === 'draw' ? null : winner,
		});
	}, [gameOver, initialGame]);

	const loserColor = useMemo(() => getLoserColor(gameOver), [gameOver]);
	const loserKingSquare = useMemo(() => (
		getKingSquareFromFen(state?.fen, loserColor)
	), [loserColor, state?.fen]);

	const checkedColor = state?.turn === 'w' ? 'white' : 'black';
	const isMyKingInCheck = state?.is_check && checkedColor === myColor;
	const checkedKingSquare = isMyKingInCheck ? getKingSquareFromFen(state?.fen, myColor) : null;

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
		checkedKingSquare,
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
		disconnectGrace: stableOpponentGrace,
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
		offerDraw: actions.offerDraw,
		confirmDrawOffer: actions.confirmDrawOffer,
		acceptDraw: actions.acceptDraw,
		declineDraw: actions.declineDraw,
	};
}
