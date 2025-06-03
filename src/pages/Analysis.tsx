import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AnalysisSidebar from '@/components/AnalysisSidebar';
import AnalysisResults from '@/components/AnalysisResults';
import AnalysisSuggestions from './Analysis/AnalysisSuggestions';

const Analysis = () => {
  const { datasetId } = useParams();
  const navigate = useNavigate();
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: dataset, isLoading: datasetLoading } = useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: prompts } = useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleRunSuggestedAnalysis = async (suggestion: any) => {
    if (!selectedModelId) {
      toast({
        title: "Model Required",
        description: "Please select a model first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-openai', {
        body: {
          prompt: suggestion.suggested_prompt,
          model: models?.find(m => m.id === selectedModelId)?.model_id || 'gpt-4o-mini',
          datasetId: datasetId,
          analysisType: suggestion.analysis_type
        }
      });

      if (error) throw error;

      const newResult = {
        id: Date.now().toString(),
        title: suggestion.title,
        content: data.response,
        timestamp: new Date().toISOString(),
        prompt: suggestion.suggested_prompt,
        model: models?.find(m => m.id === selectedModelId)?.name || 'Unknown'
      };

      setAnalysisResults(prev => [newResult, ...prev]);

      toast({
        title: "Analysis Complete",
        description: `${suggestion.title} analysis has been completed`,
      });

    } catch (error) {
      console.error('Error running suggested analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "There was an error running the analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalysisComplete = async (result: any) => {
    setAnalysisResults(prev => [result, ...prev]);
    
    // Parse and save individual suggestions if the analysis contains them
    if (result.content.includes('1.') && result.content.includes('**')) {
      try {
        await supabase.functions.invoke('parse-analysis-suggestions', {
          body: {
            analysisId: result.id,
            content: result.content,
            datasetId: datasetId
          }
        });
        
        console.log('Analysis suggestions parsed and saved');
      } catch (error) {
        console.error('Error parsing suggestions:', error);
      }
    }
  };

  if (datasetLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-muted-foreground">Loading dataset...</p>
        </div>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-destructive">Dataset not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Datasets
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analysis Dashboard</h1>
            <p className="text-muted-foreground">
              Dataset: <span className="font-medium">{dataset.name}</span> • 
              {dataset.row_count} rows • {dataset.column_count} columns
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6 min-h-[600px]">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0">
            <AnalysisSidebar
              prompts={prompts}
              models={models}
              selectedPromptId={selectedPromptId}
              selectedModelId={selectedModelId}
              onPromptSelect={setSelectedPromptId}
              onModelSelect={setSelectedModelId}
              dataset={dataset}
              onAnalysisComplete={handleAnalysisComplete}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
            />
          </div>

          {/* Right Content Area */}
          <div className="flex-1 space-y-6">
            {/* Analysis Suggestions */}
            <AnalysisSuggestions 
              datasetId={datasetId!} 
              onRunAnalysis={handleRunSuggestedAnalysis}
            />
            
            {/* Analysis Results */}
            <AnalysisResults 
              results={analysisResults} 
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
