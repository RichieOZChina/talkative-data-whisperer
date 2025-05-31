
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AnalysisSidebar from '@/components/AnalysisSidebar';
import AnalysisResults from '@/components/AnalysisResults';

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
              onAnalysisComplete={(result) => {
                setAnalysisResults(prev => [result, ...prev]);
              }}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
            />
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
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
