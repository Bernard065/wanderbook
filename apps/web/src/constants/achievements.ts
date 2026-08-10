import type { LucideIcon } from 'lucide-react';
import {
  MapPin,
  Globe,
  Luggage,
  BookOpen,
  Camera,
  Wallet,
  Bookmark,
  Compass,
  Sparkles,
} from 'lucide-react';

export type AchievementCategory =
  | 'First Journey'
  | 'Country Collector'
  | 'Mountain Explorer'
  | 'Island Hopper'
  | 'Frequent Flyer'
  | 'Memory Keeper'
  | 'Storyteller'
  | 'Globe Trotter';

export interface AchievementStats {
  placesCount: number;
  countriesCount: number;
  tripsCount: number;
  journalEntriesCount: number;
  photosCount: number;
  expensesCount: number;
  bucketListVisitedCount: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: AchievementCategory;
  isUnlocked: (stats: AchievementStats) => boolean;
}

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  'First Journey',
  'Country Collector',
  'Mountain Explorer',
  'Island Hopper',
  'Frequent Flyer',
  'Memory Keeper',
  'Storyteller',
  'Globe Trotter',
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-place',
    name: 'First Steps',
    description: 'Add your first place',
    category: 'First Journey',
    icon: MapPin,
    isUnlocked: (s) => s.placesCount >= 1,
  },
  {
    id: 'first-trip',
    name: 'Departure',
    description: 'Create your first trip',
    category: 'First Journey',
    icon: Luggage,
    isUnlocked: (s) => s.tripsCount >= 1,
  },
  {
    id: 'three-countries',
    name: 'Country Collector',
    description: 'Visit 3 different countries',
    category: 'Country Collector',
    icon: Globe,
    isUnlocked: (s) => s.countriesCount >= 3,
  },
  {
    id: 'ten-countries',
    name: 'Globe Trotter',
    description: 'Visit 10 different countries',
    category: 'Globe Trotter',
    icon: Globe,
    isUnlocked: (s) => s.countriesCount >= 10,
  },
  {
    id: 'five-places',
    name: 'Mountain Explorer',
    description: 'Add 5 places to your travel map',
    category: 'Mountain Explorer',
    icon: Compass,
    isUnlocked: (s) => s.placesCount >= 5,
  },
  {
    id: 'twenty-places',
    name: 'Wanderer',
    description: 'Add 20 places',
    category: 'Mountain Explorer',
    icon: Compass,
    isUnlocked: (s) => s.placesCount >= 20,
  },
  {
    id: 'five-trips',
    name: 'Adventurer',
    description: 'Create 5 trips',
    category: 'Frequent Flyer',
    icon: Luggage,
    isUnlocked: (s) => s.tripsCount >= 5,
  },
  {
    id: 'ten-trips',
    name: 'Frequent Flyer',
    description: 'Create 10 trips',
    category: 'Frequent Flyer',
    icon: Sparkles,
    isUnlocked: (s) => s.tripsCount >= 10,
  },
  {
    id: 'first-photo',
    name: 'Photographer',
    description: 'Upload your first photo',
    category: 'Memory Keeper',
    icon: Camera,
    isUnlocked: (s) => s.photosCount >= 1,
  },
  {
    id: 'five-photos',
    name: 'Captured Moments',
    description: 'Upload 5 photos',
    category: 'Memory Keeper',
    icon: Camera,
    isUnlocked: (s) => s.photosCount >= 5,
  },
  {
    id: 'first-journal',
    name: 'Storyteller',
    description: 'Write your first journal entry',
    category: 'Storyteller',
    icon: BookOpen,
    isUnlocked: (s) => s.journalEntriesCount >= 1,
  },
  {
    id: 'ten-journal',
    name: 'Chronicler',
    description: 'Write 10 journal entries',
    category: 'Storyteller',
    icon: BookOpen,
    isUnlocked: (s) => s.journalEntriesCount >= 10,
  },
  {
    id: 'budget-tracker',
    name: 'Budget Tracker',
    description: 'Log your first expense',
    category: 'Island Hopper',
    icon: Wallet,
    isUnlocked: (s) => s.expensesCount >= 1,
  },
  {
    id: 'dream-fulfilled',
    name: 'Dream Fulfilled',
    description: 'Visit a place from your bucket list',
    category: 'Island Hopper',
    icon: Bookmark,
    isUnlocked: (s) => s.bucketListVisitedCount >= 1,
  },
];
