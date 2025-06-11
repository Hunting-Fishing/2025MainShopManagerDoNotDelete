
import React from 'react';
import { Document } from '@/types/document';
import { DocumentCard } from './DocumentCard';

interface DocumentGridProps {
  documents: Document[];
  onDocumentClick: (document: Document) => void;
  onEditDocument: (document: Document) => void;
  onDeleteDocument: (id: string) => void;
}

export function DocumentGrid({ documents, onDocumentClick, onEditDocument, onDeleteDocument }: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
        <p className="text-gray-500">Upload your first document to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onClick={() => onDocumentClick(document)}
          onEdit={() => onEditDocument(document)}
          onDelete={() => onDeleteDocument(document.id)}
        />
      ))}
    </div>
  );
}
