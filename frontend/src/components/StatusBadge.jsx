import styled from 'styled-components';

const Badge = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	color: ${props => props.$isOnline ? '#86efac' : '#d1d5db'};
	font-weight: 700;
	font-size: 0.8rem;
	text-transform: uppercase;
	letter-spacing: 0.05em;

	&::before {
		content: '';
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: ${props => props.$isOnline ? '#22c55e' : '#9ca3af'};
		box-shadow: ${props => props.$isOnline ? '0 0 10px #22c55e' : 'none'};
		transition: background-color 300ms ease, box-shadow 300ms ease;
	}
`;

export function StatusBadge({ isOnline, text }) {
	return <Badge $isOnline={isOnline}>{text}</Badge>;
}
