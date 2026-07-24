import { useState } from 'react';
import { UserPlus, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { getInitials } from '@/lib/get-initials';
import {
  useFriendships,
  useSendFriendRequest,
  useRespondToFriendRequest,
  useRemoveFriendship,
} from '@/hooks/use-friends';

export function FriendsPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { data: friendships, isLoading, error } = useFriendships();
  const { mutate: sendRequest, isPending: isSending, error: sendError } =
    useSendFriendRequest();
  const { mutate: respond } = useRespondToFriendRequest();
  const { mutate: remove } = useRemoveFriendship();
  const [email, setEmail] = useState('');

  function handleSendRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    sendRequest(email.trim(), { onSuccess: () => setEmail('') });
  }

  const accepted = friendships?.filter((f) => f.status === 'accepted') ?? [];
  const incomingPending =
    friendships?.filter(
      (f) => f.status === 'pending' && f.addresseeId === currentUser?.id,
    ) ?? [];
  const outgoingPending =
    friendships?.filter(
      (f) => f.status === 'pending' && f.requesterId === currentUser?.id,
    ) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Friends</h1>
      <p className="text-gray-500 mb-6">
        Connect with friends to share your trips.
      </p>

      <form
        onSubmit={handleSendRequest}
        className="flex gap-2 mb-8 max-w-md"
      >
        <Input
          type="email"
          placeholder="Friend's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" disabled={isSending}>
          <UserPlus className="h-4 w-4" />
          Add
        </Button>
      </form>

      {sendError && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 mb-6 max-w-md">
          {sendError.message}
        </p>
      )}

      {isLoading && <p>Loading friends...</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}

      {incomingPending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Friend Requests</h2>
          <div className="space-y-2">
            {incomingPending.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between border rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                    {getInitials(f.friend.fullName, f.friend.email)}
                  </div>
                  <span className="text-sm">
                    {f.friend.fullName || f.friend.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      respond({ friendshipId: f.id, status: 'accepted' })
                    }
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      respond({ friendshipId: f.id, status: 'rejected' })
                    }
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {outgoingPending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Sent Requests</h2>
          <div className="space-y-2">
            {outgoingPending.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between border rounded-lg px-4 py-3"
              >
                <span className="text-sm text-gray-600">
                  {f.friend.fullName || f.friend.email}
                </span>
                <span className="text-xs text-gray-400">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">
          Friends ({accepted.length})
        </h2>
        {accepted.length === 0 && (
          <p className="text-gray-500">
            No friends yet. Add someone by email above.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {accepted.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between border rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                  {getInitials(f.friend.fullName, f.friend.email)}
                </div>
                <span className="text-sm">
                  {f.friend.fullName || f.friend.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => remove(f.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-gray-400" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
