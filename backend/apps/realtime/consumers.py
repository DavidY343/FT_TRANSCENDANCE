from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework_simplejwt.backends import TokenBackend
from django.conf import settings
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
import asyncio
import logging
import time
import uuid
from urllib.parse import parse_qs
import re
import random


User = get_user_model()

logger = logging.getLogger(__name__)


class GameConsumer(AsyncJsonWebsocketConsumer):
    """Minimal WebSocket consumer for Sprint 1.

    Supports two authentication flows:
    - Header-based: `TokenAuthMiddleware` already populates `scope['user']` for
      clients that send an Authorization header (native clients).
    - Browser-friendly: AUTH-as-first-message. The client must send as first
      JSON message: {"type":"AUTH","token":"<ACCESS_TOKEN>"} within
      AUTH_TIMEOUT seconds. Until authenticated, other messages are rejected.

    After authentication, the consumer accepts `STATE_REQUEST` and replies
    with `STATE_SYNC` (dummy payload).
    """

    AUTH_TIMEOUT = 5  # seconds to wait for AUTH message from browsers
    waiting_queue = []
    waiting_lock = asyncio.Lock()
    game_clocks = {}
    reconnect_tokens = {}
    reconnect_lock = asyncio.Lock()

    def _get_room_from_scope(self):
        try:
            qs = self.scope.get('query_string', b'').decode()
            params = parse_qs(qs)
            room_list = params.get('room') or []
            return room_list[0] if room_list else None
        except Exception:
            return None

    async def _set_room(self, room_name):
        if not room_name:
            return
        safe_room = re.sub(r"[^A-Za-z0-9_.-]", "_", room_name)
        group_name = f"room_{safe_room}"
        current = getattr(self, 'room_group', None)
        if current == group_name:
            return
        if current:
            try:
                await self.channel_layer.group_discard(current, self.channel_name)
            except Exception:
                pass
        await self.channel_layer.group_add(group_name, self.channel_name)
        self.room_group = group_name
        self.room_name = room_name

    def _make_room_name(self, user_a, user_b):
        base = f"match_{user_a}_{user_b}_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
        return re.sub(r"[^A-Za-z0-9_.-]", "_", base)

    async def _create_reconnect_token(self, user_id, room):
        token = uuid.uuid4().hex
        async with self.reconnect_lock:
            self.__class__.reconnect_tokens[token] = {
                'room': room,
                'user_id': str(user_id) if user_id else None,
            }
        return token

    async def _consume_reconnect_token(self, token):
        async with self.reconnect_lock:
            return self.__class__.reconnect_tokens.get(token)

    async def connect(self):
        # If middleware already authenticated the scope, accept immediately.
        user = self.scope.get('user')
        if user is not None and not getattr(user, 'is_anonymous', True):
            await self.accept()
            self.authenticated = True
            # add to presence group and announce
            try:
                await self.channel_layer.group_add('presence', self.channel_name)
                await self.channel_layer.group_send(
                    'presence',
                    {
                        'type': 'player.joined',
                        'sender_channel': self.channel_name,
                        'user': {
                            'id': str(user.id),
                            'username': getattr(user, 'username', None),
                        }
                    }
                )
                room = self._get_room_from_scope()
                if room:
                    await self._set_room(room)
                logger.info('WebSocket connect accepted for user=%s', getattr(user, 'username', None))
            except Exception:
                # best-effort: don't fail connection if presence announce fails
                pass
            return

        # Otherwise accept the socket but require an AUTH message within timeout.
        await self.accept()
        self.authenticated = False
        self.room_name = None
        self.room_group = None
        # start an auth timeout task
        self._auth_timeout_task = asyncio.create_task(self._auth_timeout())
        logger.info('WebSocket accepted (unauthenticated) channel=%s, waiting for AUTH msg', self.channel_name)

    async def _auth_timeout(self):
        await asyncio.sleep(self.AUTH_TIMEOUT)
        if not getattr(self, 'authenticated', False):
            try:
                await self.close(code=4001)
            except Exception:
                pass

    async def disconnect(self, close_code):
        # cancel auth timeout task if pending
        task = getattr(self, '_auth_timeout_task', None)
        if task and not task.done():
            task.cancel()

        # If user was authenticated, remove from presence and announce
        user = self.scope.get('user')
        if getattr(self, 'authenticated', False) and user is not None and not getattr(user, 'is_anonymous', True):
            try:
                async with self.waiting_lock:
                    queue = self.__class__.waiting_queue
                    self.__class__.waiting_queue = [w for w in queue if w.get('channel') != self.channel_name]
                # Cleanup game_clocks if game not started
                room = getattr(self, 'room_name', None)
                if room and room in self.__class__.game_clocks:
                    clock_data = self.__class__.game_clocks[room]
                    if clock_data['last_update'] is None:  # Game not started
                        user_id = str(getattr(user, 'id', ''))
                        clock_data['ready_players'].discard(user_id)
                        if not clock_data['ready_players']:
                            # No players ready, remove room
                            del self.__class__.game_clocks[room]
                await self.channel_layer.group_discard('presence', self.channel_name)
                room_group = getattr(self, 'room_group', None)
                if room_group:
                    await self.channel_layer.group_discard(room_group, self.channel_name)
                await self.channel_layer.group_send(
                    'presence',
                    {
                        'type': 'player.disconnected',
                        'sender_channel': self.channel_name,
                        'user': {
                            'id': str(user.id),
                            'username': getattr(user, 'username', None),
                        }
                    }
                )
                logger.info('WebSocket disconnected for user=%s channel=%s', getattr(user, 'username', None), self.channel_name)
            except Exception:
                pass

        return

    async def receive_json(self, content, **kwargs):
        msg_type = content.get('type')

        # If not authenticated yet, only accept AUTH message
        if not getattr(self, 'authenticated', False):
            if msg_type == 'AUTH':
                token = content.get('token')
                if not token:
                    await self.send_json({'type': 'ERROR', 'message': 'no token provided'})
                    await self.close(code=4002)
                    return

                # validate token and set scope['user']
                try:
                    token_backend = TokenBackend(
                        algorithm=settings.SIMPLE_JWT.get('ALGORITHM', 'HS256'),
                        signing_key=settings.SECRET_KEY,
                    )
                    validated = token_backend.decode(token, verify=True)
                    user_id = validated.get('user_id') or validated.get('user')
                    if not user_id:
                        await self.send_json({'type': 'ERROR', 'message': 'invalid token payload'})
                        await self.close(code=4003)
                        return

                    user = await database_sync_to_async(User.objects.get)(id=user_id)
                    self.scope['user'] = user
                    self.authenticated = True
                    # cancel auth timeout
                    task = getattr(self, '_auth_timeout_task', None)
                    if task and not task.done():
                        task.cancel()
                        await self.send_json({'type': 'AUTH_OK'})
                        logger.info('WebSocket AUTH_OK for user=%s channel=%s', getattr(user, 'username', None), self.channel_name)
                        # add to presence group and announce
                        try:
                            await self.channel_layer.group_add('presence', self.channel_name)
                            await self.channel_layer.group_send(
                                'presence',
                                {
                                    'type': 'player.joined',
                                    'user': {
                                        'id': str(user.id),
                                        'username': getattr(user, 'username', None),
                                    }
                                }
                            )
                            room = content.get('room') or self._get_room_from_scope()
                            if room:
                                await self._set_room(room)
                        except Exception:
                            pass
                    return
                except Exception as e:
                    await self.send_json({'type': 'ERROR', 'message': 'auth failed'})
                    await self.close(code=4003)
                    return
            else:
                await self.send_json({'type': 'ERROR', 'message': 'auth required'})
                return

        # At this point authenticated == True, handle normal messages
        if msg_type == 'STATE_REQUEST':
            room = content.get('room')
            if room:
                await self._set_room(room)
            # return a dummy STATE_SYNC payload
            payload = {
                'fen': 'startpos',
                'turn': 'w',
                'clocks': {'wMs': 300000, 'bMs': 300000},
                'status': 'PLAYING',
                'players': {},
            }
            await self.send_json({'type': 'STATE_SYNC', 'payload': payload})
            logger.info('STATE_REQUEST handled for user=%s', getattr(self.scope.get('user'), 'username', None))
        elif msg_type == 'MATCH_FOUND':
            room = content.get('room') or getattr(self, 'room_name', None) or 'demo-room'
            user = self.scope.get('user')
            token = await self._create_reconnect_token(getattr(user, 'id', None), room)
            payload = {
                'room': room,
                'players': {
                    'white': getattr(user, 'username', None),
                    'black': 'opponent',
                },
                'reconnectToken': token,
            }
            await self.send_json({'type': 'MATCH_FOUND', 'payload': payload})
        elif msg_type == 'MATCHMAKE':
            user = self.scope.get('user')
            username = getattr(user, 'username', None) or 'player'
            async with self.waiting_lock:
                queue = self.__class__.waiting_queue
                self.__class__.waiting_queue = [w for w in queue if w.get('channel') != self.channel_name]
                queue = self.__class__.waiting_queue
                if queue:
                    opponent = queue.pop(0)
                    room = content.get('room') or self._make_room_name(username, opponent.get('username', 'opponent'))
                    await self._set_room(room)
                    # Randomly assign white/black
                    user_id = str(getattr(user, 'id', ''))
                    opponent_id = opponent.get('user_id')
                    colors = ['white', 'black']
                    random.shuffle(colors)
                    user_color = colors[0]
                    opponent_color = colors[1]
                    self.__class__.game_clocks[room] = {'wMs': 300000, 'bMs': 300000, 'last_update': None, 'active_player': None, 'ready_players': set(), 'white_id': white_id, 'black_id': black_id}
                    token_self = await self._create_reconnect_token(getattr(user, 'id', None), room)
                    token_opp = await self._create_reconnect_token(opponent.get('user_id'), room)
                    # Determine players payload for self
                    if user_color == 'white':
                        white_id = user_id
                        black_id = opponent_id
                        players_self = {'white': username, 'black': opponent.get('username', 'opponent')}
                        white_username = username
                        black_username = opponent.get('username', 'opponent')
                    else:
                        white_id = opponent_id
                        black_id = user_id
                        players_self = {'white': opponent.get('username', 'opponent'), 'black': username}
                        white_username = opponent.get('username', 'opponent')
                        black_username = username
                    payload = {
                        'room': room,
                        'players': players_self,
                        'clocks': {
                            'wMs': 300000, 
                            'bMs': 300000
                        },
                        'reconnectToken': token_self,
                    }
                    await self.send_json({'type': 'MATCH_FOUND', 'payload': payload})
                    # Determine players payload for opponent
                    if opponent_color == 'white':
                        players_opp = {'white': opponent.get('username', 'opponent'), 'black': username}
                    else:
                        players_opp = {'white': username, 'black': opponent.get('username', 'opponent')}
                    await self.channel_layer.send(
                        opponent['channel'],
                        {
                            'type': 'match.found',
                            'payload': {
                                'room': room,
                                'players': players_opp,
                                'reconnectToken': token_opp,
                            }
                        }
                    )
                    await self.channel_layer.group_send(
                        self.room_group,
                        {
                            'type': 'game.ready',
                            'room': room,
                            'players': {'white': white_username, 'black': black_username},
                        }
                    )
                else:
                    self.__class__.waiting_queue.append(
                        {
                            'channel': self.channel_name,
                            'username': username,
                            'user_id': str(getattr(user, 'id', '')),
                        }
                    )
                    await self.send_json({'type': 'MATCH_QUEUED'})
        elif msg_type == 'MOVE_SUBMIT':
            room = getattr(self, 'room_name', None)
            if not room or room not in self.__class__.game_clocks:
                await self.send_json({'type': 'ERROR', 'message': 'not in a game room'})
                return
            clock_data = self.__class__.game_clocks[room]
            if clock_data['last_update'] is None:
                await self.send_json({'type': 'ERROR', 'message': 'game not started'})
                return
            # Check turn using IDs
            user_id = str(getattr(self.scope.get('user'), 'id', ''))
            if (clock_data['active_player'] == 'w' and user_id != clock_data['white_id']) or \
               (clock_data['active_player'] == 'b' and user_id != clock_data['black_id']):
                await self.send_json({'type': 'ERROR', 'message': 'not your turn'})
                return
            move = content.get('move') or {'from': 'e2', 'to': 'e4'}
            # Calcular tiempo transcurrido
            now = time.time()
            elapsed_ms = (now - clock_data['last_update']) * 1000
            if clock_data['active_player'] == 'w':
                clock_data['wMs'] = max(0, clock_data['wMs'] - elapsed_ms)
                new_turn = 'b'
            else:
                clock_data['bMs'] = max(0, clock_data['bMs'] - elapsed_ms)
                new_turn = 'w'
            clock_data['active_player'] = new_turn
            clock_data['last_update'] = now
            # Check for game over (maqueta para futuros finales)
            winner = None
            reason = None
            # TODO: Timeout detection (comentado por ahora)
            # if clock_data['wMs'] <= 0:
            #     winner = 'black'
            #     reason = 'timeout'
            # elif clock_data['bMs'] <= 0:
            #     winner = 'white'
            #     reason = 'timeout'
            # TODO: Checkmate detection (futuro: integrar con lógica de ajedrez)
            # if is_checkmate(board, new_turn):  # Función hipotética
            #     winner = 'white' if new_turn == 'b' else 'black'
            #     reason = 'checkmate'
            # TODO: Stalemate detection (futuro)
            # elif is_stalemate(board, new_turn):
            #     winner = None
            #     reason = 'stalemate'
            if winner is not None:
                payload_game_end = {
                    'winner': winner,
                    'reason': reason,
                    'final_clocks': {'wMs': int(clock_data['wMs']), 'bMs': int(clock_data['bMs'])},
                }
                await self.channel_layer.group_send(
                    self.room_group,
                    {
                        'type': 'game.end',
                        'payload': payload_game_end,
                    }
                )
                del self.__class__.game_clocks[room]
                return  # No send move.applied if game over
            payload = {
                'move': move,
                'fen': 'startpos',  # Actualiza con lógica real de ajedrez
                'turn': new_turn,
                'clocks': {'wMs': int(clock_data['wMs']), 'bMs': int(clock_data['bMs'])},
            }
            # if winner:
            #     payload['game_over'] = {'winner': winner, 'reason': 'time'}
            #     # Remove room after game over
            #     del self.__class__.game_clocks[room]
            await self.channel_layer.group_send(
                self.room_group,
                {
                    'type': 'move.applied',
                    'payload': payload,
                }
            )
        elif msg_type == 'READY':
            room = getattr(self, 'room_name', None)
            if not room or room not in self.__class__.game_clocks:
                await self.send_json({'type': 'ERROR', 'message': 'not in a game room'})
                return
            user = self.scope.get('user')
            user_id = str(getattr(user, 'id', ''))
            clock_data = self.__class__.game_clocks[room]
            clock_data['ready_players'].add(user_id)
            if len(clock_data['ready_players']) == 2:
                # Ambos listos: iniciar reloj
                clock_data['last_update'] = time.time()
                clock_data['active_player'] = 'w'
                await self.channel_layer.group_send(
                    self.room_group,
                    {
                        'type': 'game.start',
                        'room': room,
                        'clocks': {'wMs': clock_data['wMs'], 'bMs': clock_data['bMs']},
                    }
                )
            else:
                # Confirmar al usuario que está listo
                await self.send_json({'type': 'READY_CONFIRMED'})
        elif msg_type == 'RESIGN':
            room = getattr(self, 'room_name', None)
            if not room or room not in self.__class__.game_clocks:
                await self.send_json({'type': 'ERROR', 'message': 'not in a game room'})
                return
            user = self.scope.get('user')
            user_id = str(getattr(user, 'id', ''))
            clock_data = self.__class__.game_clocks[room]
            # Determinar winner: el oponente gana
            if user_id == clock_data['white_id']:
                winner = 'black'
            else:
                winner = 'white'
            payload = {
                'winner': winner,
                'reason': 'resignation',
                'final_clocks': {'wMs': int(clock_data['wMs']), 'bMs': int(clock_data['bMs'])},
            }
            await self.channel_layer.group_send(
                self.room_group,
                {
                    'type': 'game.end',
                    'payload': payload,
                }
            )
            # Limpiar
            del self.__class__.game_clocks[room]
        elif msg_type == 'RECONNECT':
            token = content.get('token')
            if not token:
                await self.send_json({'type': 'ERROR', 'message': 'token required'})
                return
            token_data = await self._consume_reconnect_token(token)
            if not token_data:
                await self.send_json({'type': 'ERROR', 'message': 'invalid token'})
                return
            user = self.scope.get('user')
            user_id = str(getattr(user, 'id', '')) if user else None
            if token_data.get('user_id') and user_id and token_data.get('user_id') != user_id:
                await self.send_json({'type': 'ERROR', 'message': 'token user mismatch'})
                return
            room = token_data.get('room')
            if not room:
                await self.send_json({'type': 'ERROR', 'message': 'room missing for token'})
                return
            await self._set_room(room)
            # Enviar STATE_SYNC si hay un juego activo en el room (temporal, pendiente acuerdo con Person 2/3)
            if room in self.__class__.game_clocks:
                clock_data = self.__class__.game_clocks[room]
                state_payload = {
                    'fen': 'startpos',  # TODO: Acordar con Person 5 para FEN real desde lógica de ajedrez
                    'turn': clock_data['active_player'],
                    'clocks': {'wMs': int(clock_data['wMs']), 'bMs': int(clock_data['bMs'])},
                    'status': 'PLAYING',
                    'players': {'white': 'white_username', 'black': 'black_username'},  # TODO: Acordar con Person 2/3 para obtener usernames/IDs de DB
                    'active_player': clock_data['active_player'],
                }
                await self.send_json({'type': 'STATE_SYNC', 'payload': state_payload})
            payload = {
                'room': room,
                'user': {
                    'id': str(getattr(user, 'id', '')),
                    'username': getattr(user, 'username', None),
                },
                'reconnectToken': token,
            }
            # Add clocks if game active
            if room in self.__class__.game_clocks and self.__class__.game_clocks[room]['last_update'] is not None:
                clock_data = self.__class__.game_clocks[room]
                payload['clocks'] = {'wMs': int(clock_data['wMs']), 'bMs': int(clock_data['bMs'])}
                payload['active_player'] = clock_data['active_player']
            await self.send_json({'type': 'PLAYER_RECONNECTED', 'payload': payload})
            room_group = getattr(self, 'room_group', None)
            if room_group:
                group_payload = {
                    'sender_channel': self.channel_name,
                    'room': room,
                    'user': payload['user'],
                }
                if 'clocks' in payload:
                    group_payload['clocks'] = payload['clocks']
                    group_payload['active_player'] = payload['active_player']
                await self.channel_layer.group_send(
                    room_group,
                    {
                        'type': 'player.reconnected',
                        'payload': group_payload,
                    }
                )
        elif msg_type == 'PING':
            await self.send_json({'type': 'PONG'})
        elif msg_type == 'ROOM_JOIN':
            room = content.get('room')
            if not room:
                await self.send_json({'type': 'ERROR', 'message': 'room required'})
                return
            await self._set_room(room)
            # Enviar STATE_SYNC si hay un juego activo en el room (temporal, pendiente acuerdo con Person 2/3)
            if room in self.__class__.game_clocks:
                clock_data = self.__class__.game_clocks[room]
                payload = {
                    'fen': 'startpos',  # TODO: Acordar con Person 5 para FEN real desde lógica de ajedrez
                    'turn': clock_data['active_player'],
                    'clocks': {'wMs': int(clock_data['wMs']), 'bMs': int(clock_data['bMs'])},
                    'status': 'PLAYING',
                    'players': {'white': 'white_username', 'black': 'black_username'},  # TODO: Acordar con Person 2/3 para obtener usernames/IDs de DB
                    'active_player': clock_data['active_player'],
                }
                await self.send_json({'type': 'STATE_SYNC', 'payload': payload})
            await self.send_json({'type': 'ROOM_JOINED', 'room': room})
        else:
            # echo unknown types for debugging
            await self.send_json({'type': 'ERROR', 'message': 'unknown message type'})
            logger.info('Unknown message type received: %s', msg_type)

    # Group event handlers for presence broadcasts
    async def player_joined(self, event):
        """Called when a player joins the presence group."""
        # ignore events emitted by ourselves
        if event.get('sender_channel') == self.channel_name:
            return
        user = event.get('user')
        await self.send_json({'type': 'PLAYER_JOINED', 'user': user})

    async def player_disconnected(self, event):
        """Called when a player disconnects from the presence group."""
        if event.get('sender_channel') == self.channel_name:
            return
        user = event.get('user')
        await self.send_json({'type': 'PLAYER_DISCONNECTED', 'user': user})

    async def match_found(self, event):
        await self.send_json({'type': 'MATCH_FOUND', 'payload': event.get('payload')})

    async def player_reconnected(self, event):
        if event.get('sender_channel') == self.channel_name:
            return
        await self.send_json({'type': 'PLAYER_RECONNECTED', 'payload': {'room': event.get('room'), 'user': event.get('user')}})

    async def game_ready(self, event):
        await self.send_json({
            'type': 'GAME_READY',
            'room': event['room'],
            'players': event['players'],
        })

    async def game_start(self, event):
        await self.send_json({
            'type': 'GAME_START',
            'room': event['room'],
            'clocks': event['clocks'],
        })

    async def move_applied(self, event):
        await self.send_json({'type': 'MOVE_APPLIED', 'payload': event.get('payload')})

    async def game_end(self, event):
        await self.send_json({'type': 'GAME_END', 'payload': event.get('payload')})
