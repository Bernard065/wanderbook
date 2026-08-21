import { AddPlaceDialog } from '@/components/add-place-dialog';
import { AddJournalEntryDialog } from '@/components/add-journal-entry-dialog';
import { AddExpenseDialog } from '@/components/add-expense-dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Camera, DollarSign, BookOpen } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          Quick Actions
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <AddPlaceDialog>
          <Button
            size="sm"
            variant="outline"
            className="justify-start rounded-2xl border-sky-100 bg-[linear-gradient(135deg,#e0f2fe_0%,#eff6ff_100%)] text-sky-700 hover:border-sky-200 hover:bg-sky-100"
          >
            <MapPin className="mr-2 h-4 w-4" /> Add Place
          </Button>
        </AddPlaceDialog>

        <AddJournalEntryDialog>
          <Button
            size="sm"
            variant="outline"
            className="justify-start rounded-2xl border-violet-100 bg-[linear-gradient(135deg,#f5f3ff_0%,#eef2ff_100%)] text-violet-700 hover:border-violet-200 hover:bg-violet-100"
          >
            <BookOpen className="mr-2 h-4 w-4" /> Write Journal
          </Button>
        </AddJournalEntryDialog>

        <AddExpenseDialog>
          <Button
            size="sm"
            variant="outline"
            className="justify-start rounded-2xl border-amber-100 bg-[linear-gradient(135deg,#fff7ed_0%,#fef3c7_100%)] text-amber-700 hover:border-amber-200 hover:bg-amber-100"
          >
            <DollarSign className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </AddExpenseDialog>

        <Button
          size="sm"
          variant="outline"
          className="justify-start rounded-2xl border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#d1fae5_100%)] text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100"
        >
          <Camera className="mr-2 h-4 w-4" /> Upload Photos
        </Button>
      </div>
    </div>
  );
}

export default QuickActions;
