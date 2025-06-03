
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Clock, Target, Play } from 'lucide-react';

interface AnalysisSuggestionsProps {
  datasetId: string;
  onRunAnalysis: (suggestion: any) => void;
}

const AnalysisSuggestions = ({ datasetId, onRunAnalysis }: AnalysisSuggestionsProps) => {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['analysis-suggestions', datasetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analysis_suggestions')
        .select('*')
        .eq('dataset_id', datasetId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAnalysisTypeColor = (type: string) => {
    switch (type) {
      case 'quality_analysis': return 'bg-blue-100 text-blue-800';
      case 'vendor_analysis': return 'bg-purple-100 text-purple-800';
      case 'trend_analysis': return 'bg-indigo-100 text-indigo-800';
      case 'cost_analysis': return 'bg-orange-100 text-orange-800';
      case 'correlation_analysis': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading analysis suggestions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Analysis Suggestions Yet</h3>
          <p className="text-muted-foreground">
            Run an analysis to get AI-generated suggestions for deeper insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5" />
        <h3 className="text-lg font-semibold">AI Analysis Suggestions</h3>
        <Badge variant="outline">{suggestions.length} suggestions</Badge>
      </div>
      
      {suggestions.map((suggestion) => (
        <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{suggestion.title}</CardTitle>
              <Button
                size="sm"
                onClick={() => onRunAnalysis(suggestion)}
                className="flex items-center gap-1"
              >
                <Play className="h-3 w-3" />
                Run Analysis
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge 
                variant="secondary" 
                className={getAnalysisTypeColor(suggestion.analysis_type)}
              >
                {suggestion.analysis_type.replace('_', ' ')}
              </Badge>
              <Badge 
                variant="outline" 
                className={getComplexityColor(suggestion.complexity_level)}
              >
                {suggestion.complexity_level}
              </Badge>
              {suggestion.estimated_time_minutes && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {suggestion.estimated_time_minutes}m
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {suggestion.description}
            </p>
            
            {suggestion.required_columns && suggestion.required_columns.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Required Columns:
                </p>
                <div className="flex gap-1 flex-wrap">
                  {suggestion.required_columns.map((column: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {column}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {suggestion.suggested_prompt && (
              <div className="bg-muted p-2 rounded text-xs">
                <p className="font-medium mb-1">Suggested Prompt:</p>
                <p className="text-muted-foreground">{suggestion.suggested_prompt}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalysisSuggestions;
