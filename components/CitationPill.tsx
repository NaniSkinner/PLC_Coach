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
        className="cursor-pointer hover:bg-st-purple hover:text-white hover:border-st-purple transition-all duration-200 border-st-gray-300 text-st-gray-700 text-xs py-1 rounded-xl"
        onClick={() => setIsModalOpen(true)}
      >
        {displayName}
      </Badge>

      <CitationModal
        citation={citation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
