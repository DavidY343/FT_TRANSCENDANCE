from django.test import TransactionTestCase
from channels.testing import WebsocketCommunicator
from config.asgi import application
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import asyncio

User = get_user_model()

class GameConsumerTests(TransactionTestCase):
    reset_sequences = True

    def test_state_request_with_header(self):
        # create user (sync) before entering async context
        u = User.objects.create_user(username='test_ws_1', email='test1@example.com', password='testpass')
        refresh = RefreshToken.for_user(u)
        access = str(refresh.access_token)

        async def run():
            communicator = WebsocketCommunicator(
                application,
                "/ws/game/",
                headers=[(b'authorization', f"Bearer {access}".encode())],
            )
            connected, _ = await communicator.connect()
            self.assertTrue(connected)

            # request state
            await communicator.send_json_to({"type": "STATE_REQUEST", "room": "demo-room"})
            response = await communicator.receive_json_from()
            self.assertEqual(response.get('type'), 'STATE_SYNC')

            await communicator.disconnect()

        asyncio.get_event_loop().run_until_complete(run())

    def test_presence_broadcast_between_two_clients(self):
        # create two users (sync)
        u1 = User.objects.create_user(username='p1', email='p1@example.com', password='testpass')
        u2 = User.objects.create_user(username='p2', email='p2@example.com', password='testpass')
        r1 = RefreshToken.for_user(u1)
        r2 = RefreshToken.for_user(u2)
        a1 = str(r1.access_token)
        a2 = str(r2.access_token)

        async def run():
            comm1 = WebsocketCommunicator(application, "/ws/game/", headers=[(b'authorization', f"Bearer {a1}".encode())])
            comm2 = WebsocketCommunicator(application, "/ws/game/", headers=[(b'authorization', f"Bearer {a2}".encode())])

            connected1, _ = await comm1.connect()
            self.assertTrue(connected1)

            # connect comm2; comm1 should receive PLAYER_JOINED
            connected2, _ = await comm2.connect()
            self.assertTrue(connected2)

            msg = await comm1.receive_json_from()
            # We expect a PLAYER_JOINED message to comm1
            self.assertEqual(msg.get('type'), 'PLAYER_JOINED')
            self.assertEqual(msg.get('user', {}).get('username'), 'p2')

            # Now disconnect comm2 and expect comm1 to receive PLAYER_DISCONNECTED
            await comm2.disconnect()
            msg2 = await comm1.receive_json_from()
            self.assertEqual(msg2.get('type'), 'PLAYER_DISCONNECTED')
            self.assertEqual(msg2.get('user', {}).get('username'), 'p2')

            await comm1.disconnect()

        asyncio.get_event_loop().run_until_complete(run())

    def test_ping_pong(self):
        u = User.objects.create_user(username='ping_user', email='ping@example.com', password='testpass')
        refresh = RefreshToken.for_user(u)
        access = str(refresh.access_token)

        async def run():
            communicator = WebsocketCommunicator(
                application,
                "/ws/game/",
                headers=[(b'authorization', f"Bearer {access}".encode())],
            )
            connected, _ = await communicator.connect()
            self.assertTrue(connected)

            await communicator.send_json_to({"type": "PING"})
            response = await communicator.receive_json_from()
            self.assertEqual(response.get('type'), 'PONG')

            await communicator.disconnect()

        asyncio.get_event_loop().run_until_complete(run())

    def test_matchmake_pairs_clients(self):
        u1 = User.objects.create_user(username='match_a', email='ma@example.com', password='testpass')
        u2 = User.objects.create_user(username='match_b', email='mb@example.com', password='testpass')
        a1 = str(RefreshToken.for_user(u1).access_token)
        a2 = str(RefreshToken.for_user(u2).access_token)

        async def run():
            comm1 = WebsocketCommunicator(application, "/ws/game/", headers=[(b'authorization', f"Bearer {a1}".encode())])
            comm2 = WebsocketCommunicator(application, "/ws/game/", headers=[(b'authorization', f"Bearer {a2}".encode())])

            connected1, _ = await comm1.connect()
            connected2, _ = await comm2.connect()
            self.assertTrue(connected1)
            self.assertTrue(connected2)

            await comm1.send_json_to({"type": "MATCHMAKE"})
            queued = await comm1.receive_json_from()
            self.assertEqual(queued.get('type'), 'MATCH_QUEUED')

            await comm2.send_json_to({"type": "MATCHMAKE"})
            async def wait_for_match(comm):
                for _ in range(5):
                    try:
                        msg = await comm.receive_json_from(timeout=2)
                    except asyncio.TimeoutError:
                        continue
                    if msg.get('type') == 'MATCH_FOUND':
                        return msg
                return None

            msg1 = await wait_for_match(comm1)
            msg2 = await wait_for_match(comm2)
            self.assertIsNotNone(msg1)
            self.assertIsNotNone(msg2)

            await comm1.disconnect()
            await comm2.disconnect()

        asyncio.get_event_loop().run_until_complete(run())

    def test_reconnect_joins_room(self):
        u = User.objects.create_user(username='recon_user', email='recon@example.com', password='testpass')
        access = str(RefreshToken.for_user(u).access_token)

        async def run():
            communicator = WebsocketCommunicator(
                application,
                "/ws/game/",
                headers=[(b'authorization', f"Bearer {access}".encode())],
            )
            connected, _ = await communicator.connect()
            self.assertTrue(connected)

            await communicator.send_json_to({"type": "MATCH_FOUND", "room": "demo-room"})
            match_msg = await communicator.receive_json_from()
            token = match_msg.get('payload', {}).get('reconnectToken')
            self.assertIsNotNone(token)

            await communicator.send_json_to({"type": "RECONNECT", "token": token})
            response = await communicator.receive_json_from()
            self.assertEqual(response.get('type'), 'PLAYER_RECONNECTED')
            self.assertEqual(response.get('payload', {}).get('room'), 'demo-room')

            await communicator.disconnect()

        asyncio.get_event_loop().run_until_complete(run())

    def test_move_submit_returns_applied(self):
        u = User.objects.create_user(username='move_user', email='move@example.com', password='testpass')
        refresh = RefreshToken.for_user(u)
        access = str(refresh.access_token)

        async def run():
            communicator = WebsocketCommunicator(
                application,
                "/ws/game/",
                headers=[(b'authorization', f"Bearer {access}".encode())],
            )
            connected, _ = await communicator.connect()
            self.assertTrue(connected)

            await communicator.send_json_to({"type": "MOVE_SUBMIT", "move": {"from": "e2", "to": "e4"}})
            response = await communicator.receive_json_from()
            self.assertEqual(response.get('type'), 'MOVE_APPLIED')
            self.assertEqual(response.get('payload', {}).get('move', {}).get('from'), 'e2')

            await communicator.disconnect()

        asyncio.get_event_loop().run_until_complete(run())
