import { useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '../api';

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  async function loadFriends() {
    try {
      const { data } = await api.get('/friends');
      setFriends(data);
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load friends'));
    }
  }

  async function loadRequests() {
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        api.get('/friends/requests/incoming'),
        api.get('/friends/requests/outgoing'),
      ]);
      setIncoming(incomingRes.data);
      setOutgoing(outgoingRes.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load friend requests'));
    }
  }

  async function reloadAll() {
    await Promise.all([loadFriends(), loadRequests()]);
  }

  useEffect(() => {
    reloadAll();
  }, []);

  async function searchUsers() {
    if (query.trim().length < 2) {
      setResults([]);
      setError('Type at least 2 characters to search.');
      return;
    }

    setSearching(true);
    setError('');
    try {
      const { data } = await api.get('/friends/search', { params: { q: query.trim() } });
      setResults(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to search users'));
    } finally {
      setSearching(false);
    }
  }

  async function addFriend(userId) {
    try {
      await api.post(`/friends/${userId}`);
      setResults((prev) => prev.filter((entry) => entry.id !== userId));
      await reloadAll();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add friend'));
    }
  }

  async function acceptRequest(requesterId) {
    try {
      await api.post(`/friends/requests/${requesterId}/accept`);
      await reloadAll();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to accept request'));
    }
  }

  async function rejectRequest(requesterId) {
    try {
      await api.post(`/friends/requests/${requesterId}/reject`);
      await reloadAll();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reject request'));
    }
  }

  async function removeFriend(userId) {
    try {
      await api.delete(`/friends/${userId}`);
      await reloadAll();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to remove friend'));
    }
  }

  return (
    <section className="friends-layout">
      <article className="card friends-panel friends-panel-search">
        <p className="section-kicker">Find Players</p>
        <h2>Build your circle.</h2>
        <p>Search by username or display name. Much better than asking people for an internal ID.</p>
        <div className="friends-search-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search @username or display name"
          />
          <button type="button" onClick={searchUsers}>{searching ? 'Searching...' : 'Search'}</button>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="friends-results">
          {results.length === 0 ? <p className="empty-state">No search results yet.</p> : null}
          {results.map((entry) => (
            <article key={entry.id} className="friend-card friend-card-result">
              <div>
                <strong>{entry.display_name}</strong>
                <p>@{entry.username}</p>
              </div>
              <div className="friend-card-actions">
                <span className={`presence-pill ${entry.online ? 'online' : 'offline'}`}>{entry.online ? 'Online' : 'Offline'}</span>
                <button type="button" onClick={() => addFriend(entry.id)}>Add</button>
              </div>
            </article>
          ))}
        </div>

        <div className="friends-requests-zone">
          <h3>Incoming requests</h3>
          {incoming.length === 0 ? <p className="empty-state">No incoming requests.</p> : null}
          {incoming.map((request) => (
            <article key={request.id} className="friend-card friend-card-result">
              <div>
                <strong>{request.requester?.display_name || 'Unknown user'}</strong>
                <p>@{request.requester?.username || 'unknown'}</p>
              </div>
              <div className="friend-card-actions">
                <button type="button" onClick={() => acceptRequest(request.requester_id)}>Accept</button>
                <button type="button" className="button-muted" onClick={() => rejectRequest(request.requester_id)}>Reject</button>
              </div>
            </article>
          ))}

          <h3>Outgoing requests</h3>
          {outgoing.length === 0 ? <p className="empty-state">No outgoing requests.</p> : null}
          {outgoing.map((request) => (
            <article key={request.id} className="friend-card friend-card-result">
              <div>
                <strong>{request.addressee?.display_name || 'Unknown user'}</strong>
                <p>@{request.addressee?.username || 'unknown'}</p>
              </div>
              <span className="presence-pill offline">Pending</span>
            </article>
          ))}
        </div>
      </article>

      <article className="card friends-panel friends-panel-list">
        <p className="section-kicker">Your Friends</p>
        <h2>Current board allies</h2>
        <div className="friends-results friends-list-grid">
          {friends.length === 0 ? <p className="empty-state">No friends yet. Search someone and add them from the left panel.</p> : null}
          {friends.map((friend) => (
            <article key={friend.id} className="friend-card">
              <div>
                <strong>{friend.display_name}</strong>
                <p>@{friend.username}</p>
              </div>
              <div className="friend-card-actions">
                <span className={`presence-pill ${friend.online ? 'online' : 'offline'}`}>{friend.online ? 'Online' : 'Offline'}</span>
                <button type="button" className="button-muted" onClick={() => removeFriend(friend.id)}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}
