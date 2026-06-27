import { useEffect, useMemo, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useNavigate, useParams } from 'react-router-dom';
import { api, getAccessToken, getApiErrorMessage } from '../api';

function getWsUrl(gameId, token) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/${gameId}?token=${encodeURIComponent(token)}`;
}

export default function GameRoomPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [chatDraft, setChatDraft] = useState('');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [graceEvent, setGraceEvent] = useState(null);
  const [graceRemaining, setGraceRemaining] = useState(0);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [clockNow, setClockNow] = useState(Date.now());
  const [pendingAiThinking, setPendingAiThinking] = useState(false);
  const [awaitingAiSync, setAwaitingAiSync] = useState(false);
  const [gameOver, setGameOver] = useState(null);
  const [toast, setToast] = useState(null);
  const wsRef = useRef(null);
  const chatEndRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const shouldReconnectRef = useRef(true);
  const lastClockSyncRef = useRef(Date.now());
  const meRef = useRef(null);

  const accessToken = useMemo(() => getAccessToken() || '', []);

  useEffect(() => {
    meRef.current = me;
  }, [me]);

  useEffect(() => {
    let mounted = true;

    async function loadInitialState() {
      try {
        const [{ data: stateData }, { data: meData }] = await Promise.all([
          api.get(`/games/${gameId}/state`),
          api.get('/users/me'),
        ]);
        if (mounted) {
          setState(stateData);
          setMe(meData);
          lastClockSyncRef.current = Date.now();
        }
      } catch (err) {
        if (mounted) {
          setError(getApiErrorMessage(err, 'Could not load game state'));
        }
      }
    }

    loadInitialState();

    if (!accessToken) {
      setError('Missing session token');
      return () => {
        mounted = false;
      };
    }

    shouldReconnectRef.current = true;

    function connectSocket() {
      if (!shouldReconnectRef.current) return;

      setWsStatus('connecting');
      const ws = new WebSocket(getWsUrl(gameId, accessToken));
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        setError('');
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);

        if (payload.type === 'STATE_SYNC') {
          lastClockSyncRef.current = Date.now();
          setState(payload.state);
          setAwaitingAiSync(false);
          const aiThinkingNow = Boolean(
            payload.state?.is_ai && payload.state?.turn === 'b' && payload.state?.status !== 'finished',
          );
          setPendingAiThinking(aiThinkingNow);
          if (payload.state?.status !== 'finished') {
            sessionStorage.setItem('active_game_id', String(gameId));
            setGameOver(null);
          } else {
            sessionStorage.removeItem('active_game_id');
          }
        }

        if (payload.type === 'CLOCK_TICK') {
          lastClockSyncRef.current = Date.now();
          setState((prev) => (prev ? { ...prev, clocks: payload.clocks } : prev));
        }

        if (payload.type === 'DISCONNECT_GRACE') {
          if (payload.active) {
            setGraceEvent({ userId: payload.user_id, endsAt: Date.now() + payload.seconds * 1000 });
          } else {
            setGraceEvent(null);
            setGraceRemaining(0);
          }
        }

        if (payload.type === 'MOVE_REJECTED' || payload.type === 'ERROR') {
          setError(payload.reason || payload.message || 'WebSocket error');
          setAwaitingAiSync(false);
          setPendingAiThinking(false);
        }

        if (payload.type === 'CHAT_MESSAGE') {
          setState((prev) => {
            if (!prev) return prev;
            const nextChat = [...(prev.chat_messages || []), payload.payload].slice(-100);
            return { ...prev, chat_messages: nextChat };
          });
        }

        if (payload.type === 'GAME_OVER') {
          setPendingAiThinking(false);
          setGameOver({ result: payload.result, reason: payload.reason, winner: payload.winner || null });
          sessionStorage.removeItem('active_game_id');
          if (payload.state) {
            lastClockSyncRef.current = Date.now();
            setState(payload.state);
          }
          setToast({ kind: 'result', message: buildGameOverMessage(payload, meRef.current) });
        }
      };

      ws.onerror = () => setError('WebSocket connection failed');
      ws.onclose = () => {
        if (!shouldReconnectRef.current) {
          setWsStatus('disconnected');
          return;
        }
        setWsStatus('reconnecting');
        reconnectTimerRef.current = setTimeout(connectSocket, 1500);
      };
    }

    connectSocket();

    return () => {
      mounted = false;
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [accessToken, gameId]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!chatEndRef.current) return;
    chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state?.chat_messages]);

  useEffect(() => {
    if (!graceEvent) return undefined;

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((graceEvent.endsAt - Date.now()) / 1000));
      setGraceRemaining(remaining);
      if (remaining <= 0) {
        setGraceEvent(null);
      }
    };

    updateCountdown();
    const id = setInterval(updateCountdown, 250);
    return () => clearInterval(id);
  }, [graceEvent]);

  useEffect(() => {
    const intervalId = setInterval(() => setClockNow(Date.now()), 250);
    return () => clearInterval(intervalId);
  }, []);

  function submitMove(from, to, promotion) {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected');
      return false;
    }

    const move = `${from}${to}${promotion || ''}`.toLowerCase();
    ws.send(JSON.stringify({ type: 'MOVE_SUBMIT', move, from, to, promotion }));
    if (state?.is_ai && state?.status !== 'finished') {
      setAwaitingAiSync(true);
    }
    return true;
  }

  function getPromotionCandidates(from, to) {
    const prefix = `${from}${to}`;
    const legal = state?.legal_moves || [];
    return legal
      .filter((uci) => uci.startsWith(prefix) && uci.length === 5)
      .map((uci) => uci[4]);
  }

  function openPromotionModal(from, to, candidates) {
    setPendingPromotion({ from, to, candidates: [...new Set(candidates)] });
  }

  function onPieceDrop(from, to, piece) {
    if (!canInteractBoard) {
      return false;
    }

    const maybePromotion = piece?.toLowerCase()?.includes('p') && (to.endsWith('8') || to.endsWith('1'));
    if (maybePromotion) {
      const candidates = getPromotionCandidates(from, to);
      if (candidates.length > 0) {
        openPromotionModal(from, to, candidates);
        return false;
      }
    }

    return submitMove(from, to, '');
  }

  function onSquareClick(square) {
    if (!canInteractBoard) {
      return;
    }

    if (!selectedSquare) {
      setSelectedSquare(square);
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    const candidates = getPromotionCandidates(selectedSquare, square);
    if (candidates.length > 0) {
      openPromotionModal(selectedSquare, square, candidates);
      setSelectedSquare(null);
      return;
    }

    submitMove(selectedSquare, square, '');
    setSelectedSquare(null);
  }

  function confirmPromotion(pieceCode) {
    if (!pendingPromotion) return;
    submitMove(pendingPromotion.from, pendingPromotion.to, pieceCode);
    setPendingPromotion(null);
  }

  function resign() {
    if (state?.status === 'finished') {
      return;
    }
    setConfirmAction('resign');
  }

  function sendResign() {
    setConfirmAction(null);

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected');
      return;
    }
    ws.send(JSON.stringify({ type: 'RESIGN' }));
  }

  function sendChat() {
    const ws = wsRef.current;
    const text = chatDraft.trim();
    if (!text || !ws || ws.readyState !== WebSocket.OPEN || state?.is_ai) {
      return;
    }
    ws.send(JSON.stringify({ type: 'CHAT_SEND', message: text }));
    setChatDraft('');
  }

  const myColor = useMemo(() => {
    if (!state || !me) return 'white';
    return state.players?.white_id === me.id ? 'white' : 'black';
  }, [state, me]);

  const opponentId = useMemo(() => {
    if (!state || !me) return null;
    return state.players?.white_id === me.id ? state.players?.black_id : state.players?.white_id;
  }, [me, state]);

  const isOpponentGrace = graceEvent && opponentId && graceEvent.userId === opponentId;
  const effectiveTurn = pendingAiThinking && state?.is_ai && state?.status !== 'finished' ? 'b' : state?.turn;
  const isMyTurn = state ? (effectiveTurn === 'w' && myColor === 'white') || (effectiveTurn === 'b' && myColor === 'black') : false;
  const canInteractBoard = Boolean(state) && state.status !== 'finished' && isMyTurn;

  const legalTargets = useMemo(() => {
    if (!selectedSquare || !state?.legal_moves) return [];
    return state.legal_moves.filter((uci) => uci.startsWith(selectedSquare)).map((uci) => uci.slice(2, 4));
  }, [selectedSquare, state]);

  const squareStyles = useMemo(() => {
    const styles = {};
    if (selectedSquare) {
      styles[selectedSquare] = { background: 'rgba(255, 218, 77, 0.6)' };
    }
    legalTargets.forEach((sq) => {
      styles[sq] = { background: 'radial-gradient(circle, rgba(47,139,87,0.5) 30%, transparent 32%)' };
    });
    return styles;
  }, [legalTargets, selectedSquare]);

  const displayClocks = useMemo(() => {
    const whiteMs = state?.clocks?.white_ms || 0;
    const blackMs = state?.clocks?.black_ms || 0;

    if (!state || state.status === 'finished') {
      return { whiteMs, blackMs };
    }

    // During local AI-thinking visualization, keep clocks server-authoritative to avoid jump/reset artifacts.
    if ((pendingAiThinking || awaitingAiSync) && state?.is_ai) {
      return { whiteMs, blackMs };
    }

    const elapsed = Math.max(0, clockNow - lastClockSyncRef.current);
    if (effectiveTurn === 'w') {
      return { whiteMs: Math.max(0, whiteMs - elapsed), blackMs };
    }
    return { whiteMs, blackMs: Math.max(0, blackMs - elapsed) };
  }, [awaitingAiSync, clockNow, effectiveTurn, pendingAiThinking, state]);

  function formatClock(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  function prettyReason(reason) {
    if (!reason) return 'finished';
    return reason.replaceAll('_', ' ');
  }

  function buildGameOverMessage(payload, currentUser = me) {
    if (!payload || payload.result === 'draw') return 'Draw';
    if (payload.winner?.id === currentUser?.id) return 'You won';
    if (payload.winner) return 'You lost';
    return 'Game finished';
  }

  function getGameOverSummary(details) {
    if (!details) {
      return 'Game finished';
    }

    if (details.result === 'draw') {
      return `Draw by ${prettyReason(details.reason)}`;
    }

    if (details.winner?.username) {
      return `Winner: ${details.winner.username} · ${prettyReason(details.reason)}`;
    }

    return `Game finished by ${prettyReason(details.reason)}`;
  }

  function backToLobby() {
    if (state?.status === 'finished') {
      navigate('/lobby');
      return;
    }

    setConfirmAction('leave');
  }

  function confirmLeave() {
    setConfirmAction(null);
    navigate('/lobby');
  }

  const chatMessages = state?.chat_messages || [];
  const isAiGame = Boolean(state?.is_ai);

  return (
    <section className="game-room-layout minimalist-game-layout game-room-split-layout">
      <article className="card game-room-board-panel minimalist-game-board compact-game-board">
        <div className="game-room-header-row">
          <div>
            <p className="section-kicker">Live Table</p>
            <h2>Game Room #{gameId}</h2>
          </div>
          <button type="button" onClick={backToLobby}>Back to Lobby</button>
        </div>

        {state ? (
          <article className={`turn-banner ${effectiveTurn === 'w' ? 'white-turn' : 'black-turn'}`}>
            <span>Turn</span>
            <strong>
              {effectiveTurn === 'w' ? 'White to move' : state?.is_ai ? 'AI thinking...' : 'Black to move'}
              {state.is_check ? ' ⚠️ CHECK!' : ''} · {state.time_control_minutes || 10} min
            </strong>
          </article>
        ) : null}

        <div className="clock-pair">
          <article className={`clock-card ${effectiveTurn === 'w' ? 'active' : ''}`}>
            <span>{state?.players?.white?.display_name || 'White'} (W)</span>
            <strong>{formatClock(displayClocks.whiteMs)}</strong>
          </article>
          <article className={`clock-card ${effectiveTurn === 'b' ? 'active' : ''}`}>
            <span>{state?.players?.black?.display_name || 'Black'} (B)</span>
            <strong>{formatClock(displayClocks.blackMs)}</strong>
          </article>
        </div>

        {gameOver ? (
          <p className="warning-banner">
            {getGameOverSummary(gameOver)}
          </p>
        ) : null}

      {isOpponentGrace ? (
        <p className="warning-banner">Opponent disconnected. Forfeit in {graceRemaining}s if not reconnected.</p>
      ) : null}

        {!state ? <p>Loading game state...</p> : null}
        {state ? (
          <div className="game-grid">
            <div className="board-column">
              <Chessboard
                id={`game-${gameId}`}
                position={state.fen}
                boardOrientation={myColor}
                onPieceDrop={onPieceDrop}
                onSquareClick={onSquareClick}
                customSquareStyles={squareStyles}
                arePiecesDraggable={canInteractBoard}
              />
              <div className="minimal-game-meta">
                <article className="game-meta-chip">
                  <span>Connection</span>
                  <strong>{wsStatus}</strong>
                </article>
                <article className="game-meta-chip">
                  <span>Status</span>
                  <strong>{state.status}</strong>
                </article>
                <article className="game-meta-chip">
                  <span>Moves</span>
                  <strong>{state.move_count}</strong>
                </article>
                <article className="game-meta-chip">
                  <span>Last move</span>
                  <strong>{state.last_move || '-'}</strong>
                </article>
              </div>
              <div className="inline-actions minimalist-actions">
                <button type="button" onClick={resign} disabled={state?.status === 'finished'}>
                  Resign
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}
      </article>

      <aside className="card game-chat-panel">
        <p className="section-kicker">Table Chat</p>
        <h2>Conversation</h2>
        {isAiGame ? <p className="empty-state">Chat is disabled in games against AI.</p> : null}
        {!isAiGame ? (
          <>
            <div className="game-chat-log">
              {chatMessages.length === 0 ? <p className="empty-state">No messages yet.</p> : null}
              {chatMessages.map((entry, index) => (
                <article
                  key={`${entry.at}-${index}`}
                  className={`chat-bubble ${entry.user_id === me?.id ? 'mine' : 'theirs'}`}
                >
                  <span>{entry.user_id === me?.id ? 'You' : 'Opponent'}</span>
                  <p>{entry.message}</p>
                </article>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="game-chat-compose">
              <textarea
                value={chatDraft}
                onChange={(event) => setChatDraft(event.target.value)}
                placeholder="Write to your opponent"
                maxLength={500}
              />
              <button type="button" onClick={sendChat} disabled={!chatDraft.trim() || state?.status === 'finished'}>
                Send
              </button>
            </div>
          </>
        ) : null}
      </aside>

      {pendingPromotion ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Choose Promotion Piece</h3>
            <div className="inline-actions">
              {pendingPromotion.candidates.map((pieceCode) => (
                <button key={pieceCode} type="button" onClick={() => confirmPromotion(pieceCode)}>
                  {pieceCode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {confirmAction ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>{confirmAction === 'resign' ? 'Confirm resignation' : 'Leave game room?'}</h3>
            <p>
              {confirmAction === 'resign'
                ? 'You are about to resign this game.'
                : 'Leaving does not resign, but your clock/disconnect grace may continue while you are away.'}
            </p>
            <div className="inline-actions">
              <button
                type="button"
                onClick={confirmAction === 'resign' ? sendResign : confirmLeave}
              >
                Confirm
              </button>
              <button type="button" className="button-muted" onClick={() => setConfirmAction(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="center-toast" role="status" aria-live="polite">
          {toast.message}
        </div>
      ) : null}
    </section>
  );
}
