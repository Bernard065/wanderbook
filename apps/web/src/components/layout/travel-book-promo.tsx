import { BookHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TravelBookPromo() {
  return (
    <div className="mx-3 mb-4 rounded-lg bg-blue-50 p-4">
      <div className="flex justify-center mb-3">
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
          <BookHeart className="h-6 w-6 text-blue-600" />
        </div>
      </div>
      <p className="text-sm font-semibold text-center">Print Your Travel Book</p>
      <p className="text-xs text-gray-500 text-center mt-1 mb-3">
        Create a beautiful book of your journeys.
      </p>
      <Button className="w-full" size="sm">
        Create Book
      </Button>
    </div>
  );
}
