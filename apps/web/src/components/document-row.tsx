import { FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteDocument, type Document } from '@/hooks/use-documents';

interface DocumentRowProps {
  document: Document;
}

export function DocumentRow({ document }: DocumentRowProps) {
  const { mutate: deleteDocument, isPending } = useDeleteDocument();

  return (
    <div className="flex items-center justify-between gap-3 border rounded-lg px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="h-5 w-5 text-gray-400 shrink-0" />
        <div className="min-w-0">
          <p className="font-medium truncate">{document.fileName}</p>
          <p className="text-xs text-gray-400 capitalize">
            {document.documentType.replace(/_/g, ' ')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <a href={document.url} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 text-gray-500" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isPending}
          onClick={() => deleteDocument(document.id)}
        >
          <Trash2 className="h-4 w-4 text-gray-400" />
        </Button>
      </div>
    </div>
  );
}
