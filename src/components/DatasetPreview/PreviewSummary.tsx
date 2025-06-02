
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AnalysisData } from './utils';

interface PreviewSummaryProps {
  csvData: string[][];
  analysis: AnalysisData | null;
}

const PreviewSummary = ({ csvData, analysis }: PreviewSummaryProps) => {
  if (csvData.length === 0) {
    return null;
  }

  const headers = csvData.length > 0 ? csvData[0] : [];
  const rows = csvData.length > 1 ? csvData.slice(1) : [];

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
      <Badge variant="secondary">
        {rows.length} rows shown
      </Badge>
      <Badge variant="secondary">
        {headers.length} columns
      </Badge>
      {analysis && (
        <Badge variant="secondary">
          AI Analysis: {analysis.table_name || 'Generated'}
        </Badge>
      )}
      {rows.length >= 49 && (
        <span className="text-xs">
          * Preview limited to first 50 rows
        </span>
      )}
    </div>
  );
};

export default PreviewSummary;
