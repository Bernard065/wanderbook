import {
  LayoutGrid,
  Map,
  MapPin,
  BookOpen,
  Luggage,
  Clock,
  Image,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/places', label: 'Places', icon: MapPin },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/trips', label: 'Trips', icon: Luggage },
  { to: '/timeline', label: 'Timeline', icon: Clock },
  { to: '/gallery', label: 'Gallery', icon: Image },
  { to: '/expenses', label: 'Expenses', icon: Wallet },
];
