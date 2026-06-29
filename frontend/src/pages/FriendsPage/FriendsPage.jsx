import { FriendsInfoCard } from './components/FriendsInfoCard';

import { SearchCard } from './components/SearchCard';
import { FriendsListCard } from './components/FriendsListCard';
import { RequestsCard } from './components/RequestsCard';
import { RemoveFriendModal } from './components/RemoveFriendModal';

import { useFriends } from './hooks/useFriends';

import './style/friends.css';

export default function FriendsPage()
{
	const friends = useFriends();

	return (
		<section className="friends-layout">
			<FriendsInfoCard />
			<SearchCard
				query={friends.searchQuery}
				setQuery={friends.setSearchQuery}
				results={friends.searchResults}
				hasSearched={friends.hasSearched}
				searching={friends.searching}
				actionLoading={friends.actionLoading}
				feedback={friends.getFeedback('search')}
				onSubmit={friends.submitSearch}
				onSendRequest={friends.sendRequest}
			/>
			<FriendsListCard
				friends={friends.friends}
				loading={friends.loading}
				actionLoading={friends.actionLoading}
				feedback={friends.getFeedback('friends')}
				onRequestRemoveFriend={friends.requestRemoveFriend}
			/>
			<RequestsCard
				incomingRequests={friends.incomingRequests}
				outgoingRequests={friends.outgoingRequests}
				loading={friends.loading}
				actionLoading={friends.actionLoading}
				feedback={friends.getFeedback('requests')}
				onRefresh={friends.refresh}
				onAccept={friends.acceptRequest}
				onReject={friends.rejectRequest}
			/>
			<RemoveFriendModal
				friend={friends.pendingRemoveFriend}
				actionLoading={friends.actionLoading}
				onCancel={friends.cancelRemoveFriend}
				onConfirm={friends.confirmRemoveFriend}
			/>
		</section>
	);
}
