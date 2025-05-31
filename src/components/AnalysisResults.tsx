
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Brain, Settings } from 'lucide-react';

interface AnalysisResult {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  prompt: string;
  model: string;
}

interface AnalysisResultsProps {
  results: AnalysisResult[];
  isAnalyzing: boolean;
}

const AnalysisResults = ({ results, isAnalyzing }: AnalysisResultsProps) => {
  if (results.length === 0 && !isAnalyzing) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-medium">No Analysis Results Yet</h3>
            <p className="text-muted-foreground">
              Select an analysis type and model from the sidebar to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isAnalyzing && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Running analysis...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {results.map((result) => (
        <Card key={result.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {result.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                {result.prompt}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                {result.model}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                {result.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalysisResults;
