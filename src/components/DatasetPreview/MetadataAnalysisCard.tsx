
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, AlertCircle, Sparkles } from 'lucide-react';
import { AnalysisData, ColumnAnalysis } from './utils';

interface MetadataAnalysisCardProps {
  analysis: AnalysisData | null;
  isLoading: boolean;
  datasetId: string;
  onGenerateAnalysis?: () => void;
}

const MetadataAnalysisCard = ({ analysis, isLoading, datasetId, onGenerateAnalysis }: MetadataAnalysisCardProps) => {
  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="py-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-blue-700 font-medium">Loading AI analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis || !analysis.column_analysis) {
    return (
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            AI Metadata Analysis Not Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-orange-700">
              <Sparkles className="h-5 w-5" />
              <p className="font-medium">No AI analysis has been generated for this dataset yet.</p>
            </div>
            <div className="bg-white/60 rounded-lg p-4 border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-2">What you'll get with AI analysis:</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Automatic column type detection and SQL schema generation</li>
                <li>• Intelligent data type recommendations</li>
                <li>• Column descriptions and data patterns</li>
                <li>• Sample values and statistics for each column</li>
              </ul>
            </div>
            {onGenerateAnalysis && (
              <Button 
                onClick={onGenerateAnalysis}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Analysis
              </Button>
            )}
            <p className="text-xs text-orange-600 text-center">
              Analysis is automatically generated when you upload and process a dataset through the main workflow.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-green-800">
          <Database className="h-5 w-5" />
          AI Metadata Analysis
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
            {analysis.column_analysis.length} columns analyzed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {analysis.column_analysis.map((column: ColumnAnalysis, index: number) => (
            <div key={index} className="border rounded-lg p-4 bg-white/40 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-green-800">{column.column_name}</h4>
                <Badge variant="secondary" className="bg-green-100 text-green-700">{column.sql_type}</Badge>
                <Badge variant="outline" className="border-green-300 text-green-600">{column.data_type}</Badge>
              </div>
              <p className="text-sm text-green-700 mb-3">{column.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="space-y-1">
                  <span className="font-medium text-xs uppercase tracking-wide text-green-600">Statistics</span>
                  <div className="space-y-1 text-green-700">
                    <div><span className="font-medium">Unique:</span> {column.unique_count || 'N/A'}</div>
                    <div><span className="font-medium">Nulls:</span> {column.null_count || 0}</div>
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <span className="font-medium text-xs uppercase tracking-wide text-green-600">Sample Values</span>
                  <div className="flex flex-wrap gap-1">
                    {column.sample_values?.slice(0, 4).map((value: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs px-2 py-1 border-green-300 text-green-600">
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
