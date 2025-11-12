/**
 * Citation Extraction Module
 *
 * This module handles extracting citations from LLM responses and matching them
 * to the original source chunks from the knowledge base.
 */

import type { RetrievedChunk } from './retrieval';

// Citation type
export interface Citation {
  id: string;
  sourceDocument: string;
  author: string;
  chapterOrSection?: string;
  pageNumber?: string;
  relevanceScore: number;
}

/**
 * Citation patterns for matching
 *
 * The LLM is instructed to format citations as:
 * [Source: Document Name, Section/Chapter]
 * (Source: Document Name, Section/Chapter)
 */
const CITATION_PATTERNS = [
  /\[Source: ([^\]]+)\]/g, // [Source: Book, Chapter]
  /\(Source: ([^\)]+)\)/g, // (Source: Book, Chapter)
];

/**
 * Extract citations from LLM response and match to source chunks
 *
 * This function:
 * 1. Finds all citation patterns in the response text
 * 2. Matches them to the retrieved chunks
 * 3. Returns deduplicated citations with metadata
 * 4. Falls back to top chunks if no explicit citations found
 */
export function extractCitations(
  response: string,
  retrievedChunks: RetrievedChunk[]
): { content: string; citations: Citation[] } {
  const citations: Citation[] = [];
  const seenSources = new Set<string>();

  // Try each citation pattern
  for (const pattern of CITATION_PATTERNS) {
    let match;
    const regex = new RegExp(pattern); // Create new regex to reset lastIndex

    while ((match = regex.exec(response)) !== null) {
      const citationText = match[1];

      // Find matching chunk based on source document name
      const matchingChunk = retrievedChunks.find((chunk) =>
        citationText.toLowerCase().includes(chunk.metadata.sourceDocument.toLowerCase())
      );

      if (matchingChunk && !seenSources.has(matchingChunk.id)) {
        citations.push({
          id: crypto.randomUUID(),
          sourceDocument: matchingChunk.metadata.sourceDocument,
          author: matchingChunk.metadata.author || 'Unknown',
          chapterOrSection: matchingChunk.metadata.section,
          pageNumber: matchingChunk.metadata.pageNumber,
          relevanceScore: matchingChunk.adjustedScore,
        });
        seenSources.add(matchingChunk.id);
      }
    }
  }

  // Fallback: If no citations found, add top 2 retrieved sources
  // This ensures we always provide source attribution
  if (citations.length === 0 && retrievedChunks.length > 0) {
    const topChunks = retrievedChunks.slice(0, 2);

    topChunks.forEach((chunk) => {
      if (!seenSources.has(chunk.id)) {
        citations.push({
          id: crypto.randomUUID(),
          sourceDocument: chunk.metadata.sourceDocument,
          author: chunk.metadata.author || 'Unknown',
          chapterOrSection: chunk.metadata.section,
          pageNumber: chunk.metadata.pageNumber,
          relevanceScore: chunk.adjustedScore,
        });
        seenSources.add(chunk.id);
      }
    });
  }

  // Deduplicate citations
  const deduplicated = deduplicateCitations(citations);

  return {
    content: response,
    citations: deduplicated,
  };
}

/**
 * Deduplicate citations based on source document and section
 */
function deduplicateCitations(citations: Citation[]): Citation[] {
  const seen = new Map<string, Citation>();

  for (const citation of citations) {
    const key = `${citation.sourceDocument}-${citation.chapterOrSection || 'default'}`;

    // Keep the first occurrence (highest relevance since they're sorted)
    if (!seen.has(key)) {
      seen.set(key, citation);
    }
  }

  return Array.from(seen.values());
}

/**
 * Format citation for display
 *
 * Converts citation object to human-readable string:
 * "Document Name by Author, Section, p. 42"
 */
export function formatCitation(citation: Citation): string {
  let formatted = citation.sourceDocument;

  if (citation.author) {
    formatted += ` by ${citation.author}`;
  }

  if (citation.chapterOrSection) {
    formatted += `, ${citation.chapterOrSection}`;
  }

  if (citation.pageNumber) {
    formatted += `, p. ${citation.pageNumber}`;
  }

  return formatted;
}

/**
 * Format all citations for display
 */
export function formatCitations(citations: Citation[]): string[] {
  return citations.map(formatCitation);
}
