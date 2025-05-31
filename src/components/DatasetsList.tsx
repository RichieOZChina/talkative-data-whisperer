
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import DatasetCard from './DatasetCard';
import EmptyDatasetsView from './EmptyDatasetsView';

const DatasetsList = () => {
  const [selectedPrompts, setSelectedPrompts] = useState<{[key: string]: string}>({});
  const [selectedModels, setSelectedModels] = useState<{[key: string]: string}>({});

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });
      
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

  const handlePromptChange = (datasetId: string, promptId: string) => {
    setSelectedPrompts(prev => ({...prev, [datasetId]: promptId}));
  };

  const handleModelChange = (datasetId: string, modelId: string) => {
    setSelectedModels(prev => ({...prev, [datasetId]: modelId}));
  };

  const startAnalysis = async (datasetId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to start analysis",
          variant: "destructive",
        });
        return;
      }

      const selectedPromptId = selectedPrompts[datasetId];
      const selectedModelId = selectedModels[datasetId];

      if (!selectedPromptId || !selectedModelId) {
        toast({
          title: "Selection required",
          description: "Please select both a prompt and model for analysis",
          variant: "destructive",
        });
        return;
      }

      const selectedPrompt = prompts?.find(p => p.id === selectedPromptId);
      const selectedModel = models?.find(m => m.id === selectedModelId);

      const { data, error } = await supabase
        .from('analyses')
        .insert({
          dataset_id: datasetId,
          user_id: session.session.user.id,
          analysis_type: selectedPrompt?.analysis_type || 'general_insights',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Analysis started:', data);
      console.log('Using prompt:', selectedPrompt?.name);
      console.log('Using model:', selectedModel?.name);

      toast({
        title: "Analysis started",
        description: `Analysis queued using ${selectedPrompt?.name} with ${selectedModel?.name}`,
      });
    } catch (error) {
      toast({
        title: "Error starting analysis",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Datasets</h3>
        <p className="text-muted-foreground">Loading datasets...</p>
      </div>
    );
  }

  if (!datasets || datasets.length === 0) {
    return <EmptyDatasetsView />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Datasets</h3>
      <div className="grid gap-4">
        {datasets.map((dataset) => (
          <DatasetCard
            key={dataset.id}
            dataset={dataset}
            prompts={prompts}
            models={models}
            selectedPrompts={selectedPrompts}
            selectedModels={selectedModels}
            onPromptChange={handlePromptChange}
            onModelChange={handleModelChange}
            onStartAnalysis={startAnalysis}
          />
        ))}
      </div>
    </div>
  );
};

export default DatasetsList;
