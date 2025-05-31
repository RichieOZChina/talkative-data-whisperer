import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import DatasetCard from './DatasetCard';
import EmptyDatasetsView from './EmptyDatasetsView';

const DatasetsList = () => {
  const navigate = useNavigate();
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

  const getDatasetPreview = async (dataset: any) => {
    try {
      const { data: fileData, error } = await supabase.storage
        .from('datasets')
        .download(dataset.file_path);

      if (error) {
        console.error('File download error:', error);
        throw error;
      }

      const csvText = await fileData.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      // Get first 10 rows for preview
      const previewLines = lines.slice(0, 10);
      return previewLines.join('\n');
    } catch (error) {
      console.error('Error getting dataset preview:', error);
      return 'Unable to load dataset preview';
    }
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

      // Navigate to analysis page
      navigate(`/analysis/${datasetId}`);

    } catch (error) {
      console.error('Error navigating to analysis:', error);
      
      toast({
        title: "Navigation failed",
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
