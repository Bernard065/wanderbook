import { useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PLACE_CATEGORIES } from '@/constants/place-categories';
import { emitPlaceCreated } from '@/lib/places-events';

interface AddPlaceDialogProps {
  children: React.ReactNode;
}

const initialFormState = {
  name: '',
  country: '',
  region: '',
  city: '',
  category: '',
  gpsLat: '',
  gpsLng: '',
};

export function AddPlaceDialog({ children }: AddPlaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof typeof initialFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          country: form.country,
          region: form.region || null,
          city: form.city || null,
          category: form.category,
          gpsLat: form.gpsLat ? parseFloat(form.gpsLat) : null,
          gpsLng: form.gpsLng ? parseFloat(form.gpsLng) : null,
        }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      emitPlaceCreated();
      setForm(initialFormState);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a Place</DialogTitle>
          <DialogDescription>
            Add a new place to your WanderBook. You can fill in more details
            later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              placeholder="e.g. Mt Kenya"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                required
                placeholder="e.g. Kenya"
                value={form.country}
                onChange={(e) => updateField('country', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                placeholder="e.g. Nyeri"
                value={form.region}
                onChange={(e) => updateField('region', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Optional"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => updateField('category', value)}
                required
              >
                <SelectTrigger id="category" className="w-full h-9">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {PLACE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gpsLat">Latitude</Label>
              <Input
                id="gpsLat"
                type="number"
                step="any"
                placeholder="Optional"
                value={form.gpsLat}
                onChange={(e) => updateField('gpsLat', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gpsLng">Longitude</Label>
              <Input
                id="gpsLng"
                type="number"
                step="any"
                placeholder="Optional"
                value={form.gpsLng}
                onChange={(e) => updateField('gpsLng', e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Place'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
