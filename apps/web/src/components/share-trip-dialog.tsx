import { useState } from 'react';
import { Users, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/get-initials';
import { useFriendships } from '@/hooks/use-friends';
import { useTripShares, useShareTrip, useUnshareTrip } from '@/hooks/use-trip-shares';

interface ShareTripDialogProps {
  children: React.ReactNode;
  tripId: string;
}

export function ShareTripDialog({ children, tripId }: ShareTripDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: friendships } = useFriendships();
  const { data: shares } = useTripShares(tripId);
  const { mutate: shareTrip, isPending: isSharing } = useShareTrip(tripId);
  const { mutate: unshareTrip } = useUnshareTrip(tripId);

  const friends = (friendships ?? []).filter((f) => f.status === 'accepted');
  const sharedUserIds = new Set((shares ?? []).map((s) => s.sharedWithUserId));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{children}</div>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this trip</DialogTitle>
          <DialogDescription>
            Friends you share with can view this trip, but can't edit it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {friends.length === 0 && (
            <p className="text-sm text-gray-500">
              You don't have any friends yet. Add friends first from the
              Friends page.
            </p>
          )}

          {friends.map((f) => {
            const isShared = sharedUserIds.has(f.friend.id);
            return (
              <div
                key={f.id}
                className="flex items-center justify-between border rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
                    {getInitials(f.friend.fullName, f.friend.email)}
                  </div>
                  <span className="text-sm">
                    {f.friend.fullName || f.friend.email}
                  </span>
                </div>
                {isShared ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => unshareTrip(f.friend.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isSharing}
                    onClick={() => shareTrip(f.friend.id)}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Share
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
