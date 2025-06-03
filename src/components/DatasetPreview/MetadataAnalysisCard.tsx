
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Database, AlertCircle, Sparkles, BarChart3 } from 'lucide-react';
import { AnalysisData, ColumnAnalysis } from './utils';
import { BasicDatasetMetadata } from './metadataExtraction';

interface MetadataAnalysisCardProps {
  analysis: AnalysisData | null;
  basicMetadata: BasicDatasetMetadata | null;
  isLoading: boolean;
  datasetId: string;
  onGenerateAnalysis?: () => void;
}

const MetadataAnalysisCard = ({ 
  analysis, 
  basicMetadata, 
  isLoading, 
  datasetId, 
  onGenerateAnalysis 
}: MetadataAnalysisCardProps) => {
  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="py-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-blue-700 font-medium">Loading metadata...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show immediate metadata if available
  if (basicMetadata && !analysis) {
    return (
      <div className="space-y-4">
        {/* Basic Metadata Card */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
              <BarChart3 className="h-5 w-5" />
              Dataset Metadata
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                {basicMetadata.columns.length} columns analyzed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="metadata-details">
                <AccordionTrigger className="text-blue-800 hover:text-blue-900">
                  View Column Details ({basicMetadata.columns.length} columns)
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 pt-2">
                    {basicMetadata.columns.map((column, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white/40 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-blue-800">{column.column_name}</h4>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {column.data_type_detected}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="space-y-1">
                            <span className="font-medium text-xs uppercase tracking-wide text-blue-600">Statistics</span>
                            <div className="space-y-1 text-blue-700">
                              <div><span className="font-medium">Unique:</span> {column.unique_count}</div>
                              <div><span className="font-medium">Nulls:</span> {column.null_count}</div>
                              {column.mean_value && (
                                <div><span className="font-medium">Mean:</span> {column.mean_value.toFixed(2)}</div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <span className="font-medium text-xs uppercase tracking-wide text-blue-600">Sample Values</span>
                            <div className="flex flex-wrap gap-1">
                              {column.sample_values.slice(0, 4).map((value, i) => (
                                <Badge key={i} variant="outline" className="text-xs px-2 py-1 border-blue-300 text-blue-600">
                                  {value.length > 15 ? `${value.substring(0, 15)}...` : value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* AI Enhancement Prompt */}
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Sparkles className="h-5 w-5" />
              Enhance with AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-orange-700">
                <p className="font-medium">Get AI-powered insights and SQL schema generation</p>
              </div>
              <div className="bg-white/60 rounded-lg p-4 border border-orange-200">
                <h4 className="font-medium text-orange-800 mb-2">AI enhancement includes:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Intelligent SQL schema generation with constraints</li>
                  <li>• Column descriptions and semantic meaning</li>
                  <li>• Data quality insights and recommendations</li>
                  <li>• Pattern detection and anomaly identification</li>
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
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show AI-enhanced analysis if available
  if (analysis && analysis.column_analysis) {
    return (
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800">
            <Database className="h-5 w-5" />
            AI-Enhanced Metadata Analysis
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
              {analysis.column_analysis.length} columns analyzed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ai-analysis-details">
              <AccordionTrigger className="text-green-800 hover:text-green-900">
                View AI Analysis Details ({analysis.column_analysis.length} columns)
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3 pt-2">
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    );
  }

  // No metadata available yet
  return (
    <Card className="border-gray-200 bg-gray-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <AlertCircle className="h-5 w-5" />
          No Metadata Available
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-700">
            <p className="font-medium">No metadata has been extracted for this dataset yet.</p>
          </div>
          <p className="text-sm text-gray-600">
            Metadata extraction happens automatically when you upload a dataset through the main workflow.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetadataAnalysisCard;
