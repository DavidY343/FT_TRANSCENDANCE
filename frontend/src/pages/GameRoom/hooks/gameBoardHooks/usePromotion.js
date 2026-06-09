import { useState } from 'react';

function normalizePromotionPiece(pieceCode)
{
	const value = String(pieceCode || '').toLowerCase();

	if (value.includes('q'))
		return ('q');
	if (value.includes('r'))
		return ('r');
	if (value.includes('b'))
		return ('b');
	if (value.includes('n'))
		return ('n');

	return ('');
}

function buildPromotionCandidates(legalMoves, from, to)
{
	const prefix = `${from}${to}`.toLowerCase();

	return legalMoves
		.map((move) => move.toLowerCase())
		.filter((move) => move.startsWith(prefix) && move.length === 5)
		.map((move) => move[4]);
}

export function usePromotion({ legalMoves, submitMove })
{
	const [pendingPromotion, setPendingPromotion] = useState(null);

	function getPromotionCandidates(from, to)
	{
		return buildPromotionCandidates(legalMoves, from, to);
	}

	function openPromotion(from, to, candidates)
	{
		setPendingPromotion({
			from,
			to,
			candidates: [...new Set(candidates)],
		});
	}

	function confirmPromotion(pieceCode)
	{
		if (!pendingPromotion)
			return (false);

		const promotion = normalizePromotionPiece(pieceCode);

		if (!promotion || !pendingPromotion.candidates.includes(promotion))
			return (false);

		submitMove(
			pendingPromotion.from,
			pendingPromotion.to,
			promotion
		);

		setPendingPromotion(null);
		return (true);
	}

	function cancelPromotion()
	{
		setPendingPromotion(null);
	}

	return {
		pendingPromotion,
		getPromotionCandidates,
		openPromotion,
		confirmPromotion,
		cancelPromotion,
	};
}
