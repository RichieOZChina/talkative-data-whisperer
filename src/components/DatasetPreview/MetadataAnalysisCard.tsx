
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';
import { AnalysisData, ColumnAnalysis } from './utils';

interface MetadataAnalysisCardProps {
  analysis: AnalysisData | null;
  isLoading: boolean;
}

const MetadataAnalysisCard = ({ analysis, isLoading }: MetadataAnalysisCardProps) => {
  if (isLoading) {
    return null;
  }

  if (!analysis || !analysis.column_analysis) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No AI analysis available for this dataset yet.</p>
            <p className="text-sm">Analysis will be generated automatically after upload.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" />
          AI Metadata Analysis
          <Badge variant="secondary" className="ml-2">
            {analysis.column_analysis.length} columns analyzed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {analysis.column_analysis.map((column: ColumnAnalysis, index: number) => (
            <div key={index} className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">{column.column_name}</h4>
                <Badge variant="secondary">{column.sql_type}</Badge>
                <Badge variant="outline">{column.data_type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{column.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="space-y-1">
                  <span className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Statistics</span>
                  <div className="space-y-1">
                    <div><span className="font-medium">Unique:</span> {column.unique_count || 'N/A'}</div>
                    <div><span className="font-medium">Nulls:</span> {column.null_count || 0}</div>
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <span className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Sample Values</span>
                  <div className="flex flex-wrap gap-1">
                    {column.sample_values?.slice(0, 4).map((value: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs px-2 py-1">
                        {value.length > 15 ? `${value.substring(0, 15)}...` : value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetadataAnalysisCard;
