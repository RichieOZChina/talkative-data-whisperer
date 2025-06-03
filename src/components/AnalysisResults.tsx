
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

// Simple markdown renderer for basic formatting
const renderMarkdown = (text: string) => {
  return text
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded mt-2 mb-2 overflow-x-auto"><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
    // Lists
    .replace(/^\* (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n/g, '<br />');
};

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
              <div 
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: `<p class="mb-3">${renderMarkdown(result.content)}</p>` 
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalysisResults;
