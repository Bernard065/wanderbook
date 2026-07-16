import { Search } from 'lucide-react';

export function Topbar() {
  return (
    <header className="h-16 border-b bg-white flex items-center px-6 gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search places, countries, journal..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </header>
  );
}
