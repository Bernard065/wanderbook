import { AddPlaceDialog } from '@/components/add-place-dialog';
import { AddJournalEntryDialog } from '@/components/add-journal-entry-dialog';
import { AddExpenseDialog } from '@/components/add-expense-dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Camera, DollarSign, BookOpen } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <AddPlaceDialog>
          <Button size="sm" className="justify-start">
            <MapPin className="h-4 w-4 mr-2" /> Add Place
          </Button>
        </AddPlaceDialog>

        <AddJournalEntryDialog>
          <Button size="sm" className="justify-start">
            <BookOpen className="h-4 w-4 mr-2" /> Write Journal
          </Button>
        </AddJournalEntryDialog>

        <AddExpenseDialog>
          <Button size="sm" className="justify-start">
            <DollarSign className="h-4 w-4 mr-2" /> Add Expense
          </Button>
        </AddExpenseDialog>

        <Button size="sm" className="justify-start">
          <Camera className="h-4 w-4 mr-2" /> Upload Photos
        </Button>
      </div>
    </div>
  );
}

export default QuickActions;
