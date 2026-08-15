import { DocumentRow } from '@/components/document-row';
import { UploadDocumentDialog } from '@/components/upload-document-dialog';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { Plus } from 'lucide-react';
import { useDocuments } from '@/hooks/use-documents';

export function DocumentsPage() {
  const { data: documents, isLoading, error } = useDocuments();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Documents</h1>
        <UploadDocumentDialog>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Upload
          </Button>
        </UploadDocumentDialog>
      </div>

      {isLoading && <p>Loading documents...</p>}
      {error && <ErrorMessage error={error} />}
      {documents?.length === 0 && (
        <p className="text-muted-foreground">
          No documents yet. Upload passports, tickets, or receipts to keep them
          all in one place.
        </p>
      )}

      <div className="space-y-2">
        {documents?.map((doc) => (
          <DocumentRow key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
}
