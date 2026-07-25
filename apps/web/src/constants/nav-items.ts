import {
  LayoutGrid,
  Map,
  MapPin,
  Luggage,
  BookOpen,
  Image,
  Clock,
  Wallet,
  FileText,
  Bookmark,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: LayoutGrid, end: true },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/places', label: 'Places', icon: MapPin },
  { to: '/trips', label: 'Trips', icon: Luggage },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/gallery', label: 'Gallery', icon: Image },
  { to: '/timeline', label: 'Timeline', icon: Clock },
  { to: '/expenses', label: 'Expenses', icon: Wallet },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/bucket-list', label: 'Bucket List', icon: Bookmark },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/friends', label: 'Friends', icon: Users },
];
