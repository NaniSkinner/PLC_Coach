'use client';

import { useState } from 'react';
import { Citation } from '@/types';
import { Badge } from '@/components/ui/badge';
import CitationModal from './CitationModal';

interface CitationPillProps {
  citation: Citation;
}

export default function CitationPill({ citation }: CitationPillProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Truncate document name if too long
  const displayName = citation.sourceDocument.length > 40
    ? citation.sourceDocument.substring(0, 40) + '...'
    : citation.sourceDocument;

  return (
    <>
      <Badge
        variant="outline"
        className="cursor-pointer hover:bg-st-blue-primary hover:text-white transition-colors border-st-blue-primary text-st-blue-primary"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="text-xs">
          {displayName}
        </span>
      </Badge>

      <CitationModal
        citation={citation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
