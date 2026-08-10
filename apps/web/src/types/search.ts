import type { Place, Trip } from '@org/types';

import type { BucketListItem } from '@/hooks/use-bucket-list';
import type { JournalEntry } from '@/hooks/use-journal-entries';
import type { Photo } from '@/hooks/use-photos';

export type SearchResultType =
  | 'place'
  | 'trip'
  | 'journalEntry'
  | 'memory'
  | 'bucketListItem';

export interface SearchResults {
  places: Place[];
  trips: Trip[];
  journalEntries: JournalEntry[];
  memories: Photo[];
  bucketListItems: BucketListItem[];
}

export interface SearchResultItem {
  id: string;
  path: string;
  label: string;
  type: SearchResultType;
  subtitle?: string;
}
