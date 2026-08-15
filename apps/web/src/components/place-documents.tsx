import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentRow } from '@/components/document-row';
import { ErrorMessage } from '@/components/ui/error-message';
import { UploadDocumentDialog } from '@/components/upload-document-dialog';
import { useDocuments } from '@/hooks/use-documents';

interface PlaceDocumentsProps {
  placeId: string;
}

export function PlaceDocuments({ placeId }: PlaceDocumentsProps) {
  const { data: documents, isLoading, error } = useDocuments({ placeId });

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Documents</h2>
        <UploadDocumentDialog placeId={placeId}>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
            Upload
          </Button>
        </UploadDocumentDialog>
      </div>

      {isLoading && <p>Loading documents...</p>}
      {error && <ErrorMessage error={error} />}
      {documents?.length === 0 && (
        <p className="text-muted-foreground">No documents uploaded yet.</p>
      )}

      <div className="space-y-2">
        {documents?.map((doc) => (
          <DocumentRow key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
}
