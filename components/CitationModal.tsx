'use client';

import { Citation } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CitationModalProps {
  citation: Citation;
  isOpen: boolean;
  onClose: () => void;
}

export default function CitationModal({
  citation,
  isOpen,
  onClose,
}: CitationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading text-st-blue-primary">
            {citation.sourceDocument}
          </DialogTitle>
          <DialogDescription className="text-sm text-st-gray-700">
            {citation.author && `by ${citation.author}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Citation Details */}
          <div className="bg-st-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Source Information</h3>
            <dl className="space-y-2 text-sm">
              {citation.author && (
                <div>
                  <dt className="inline font-medium">Author: </dt>
                  <dd className="inline">{citation.author}</dd>
                </div>
              )}
              {citation.chapterOrSection && (
                <div>
                  <dt className="inline font-medium">Section: </dt>
                  <dd className="inline">{citation.chapterOrSection}</dd>
                </div>
              )}
              {citation.pageNumber && (
                <div>
                  <dt className="inline font-medium">Page: </dt>
                  <dd className="inline">{citation.pageNumber}</dd>
                </div>
              )}
              {citation.relevanceScore && (
                <div>
                  <dt className="inline font-medium">Relevance: </dt>
                  <dd className="inline">{(citation.relevanceScore * 100).toFixed(1)}%</dd>
                </div>
              )}
            </dl>
          </div>

          {/* URL/Link if available */}
          {citation.url && (
            <div>
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-st-blue-primary hover:underline text-sm"
              >
                View full resource →
              </a>
            </div>
          )}

          {/* Additional Info */}
          <div className="text-xs text-st-gray-700">
            <p>
              This source was retrieved based on its relevance to your question.
              For complete context, refer to the full document.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
