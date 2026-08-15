import { Link } from 'react-router';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';

export function NotFoundPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Page not found"
        description="The page you are looking for does not exist or may have moved."
      />

      <div className="rounded-4xl border border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-foreground">404</h2>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            We couldn’t find the page you were looking for. Check the URL or
            return to the dashboard.
          </p>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Return home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
