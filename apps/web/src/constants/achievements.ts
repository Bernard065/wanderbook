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
} from 'lucide-react';

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
  isUnlocked: (stats: AchievementStats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-place',
    name: 'First Steps',
    description: 'Add your first place',
    icon: MapPin,
    isUnlocked: (s) => s.placesCount >= 1,
  },
  {
    id: 'five-places',
    name: 'Explorer',
    description: 'Add 5 places',
    icon: Compass,
    isUnlocked: (s) => s.placesCount >= 5,
  },
  {
    id: 'twenty-places',
    name: 'Wanderer',
    description: 'Add 20 places',
    icon: Compass,
    isUnlocked: (s) => s.placesCount >= 20,
  },
  {
    id: 'three-countries',
    name: 'Globetrotter',
    description: 'Visit 3 different countries',
    icon: Globe,
    isUnlocked: (s) => s.countriesCount >= 3,
  },
  {
    id: 'ten-countries',
    name: 'World Traveler',
    description: 'Visit 10 different countries',
    icon: Globe,
    isUnlocked: (s) => s.countriesCount >= 10,
  },
  {
    id: 'first-trip',
    name: 'Planner',
    description: 'Create your first trip',
    icon: Luggage,
    isUnlocked: (s) => s.tripsCount >= 1,
  },
  {
    id: 'five-trips',
    name: 'Adventurer',
    description: 'Create 5 trips',
    icon: Luggage,
    isUnlocked: (s) => s.tripsCount >= 5,
  },
  {
    id: 'first-journal',
    name: 'Storyteller',
    description: 'Write your first journal entry',
    icon: BookOpen,
    isUnlocked: (s) => s.journalEntriesCount >= 1,
  },
  {
    id: 'ten-journal',
    name: 'Chronicler',
    description: 'Write 10 journal entries',
    icon: BookOpen,
    isUnlocked: (s) => s.journalEntriesCount >= 10,
  },
  {
    id: 'first-photo',
    name: 'Photographer',
    description: 'Upload your first photo',
    icon: Camera,
    isUnlocked: (s) => s.photosCount >= 1,
  },
  {
    id: 'budget-tracker',
    name: 'Budget Tracker',
    description: 'Log your first expense',
    icon: Wallet,
    isUnlocked: (s) => s.expensesCount >= 1,
  },
  {
    id: 'dream-fulfilled',
    name: 'Dream Fulfilled',
    description: 'Visit a place from your bucket list',
    icon: Bookmark,
    isUnlocked: (s) => s.bucketListVisitedCount >= 1,
  },
];
